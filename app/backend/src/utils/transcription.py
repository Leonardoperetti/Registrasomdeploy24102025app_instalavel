import os
import subprocess
import json
import re
from collections import Counter
from difflib import SequenceMatcher

def transcribe_audio_manus(audio_filepath):
    """Transcreve um arquivo de áudio para texto usando a ferramenta manus-speech-to-text."""
    try:
        # Executa o comando manus-speech-to-text
        command = ["manus-speech-to-text", audio_filepath]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        
        # A saída da ferramenta é o texto transcrito
        transcription_text = result.stdout.strip()
        
        # Processar e limpar a transcrição
        return process_transcription(transcription_text)
    except subprocess.CalledProcessError as e:
        print(f"Erro ao transcrever áudio com manus-speech-to-text: {e.stderr}")
        return None
    except Exception as e:
        print(f"Erro inesperado ao transcrever áudio: {e}")
        return None

def process_transcription(transcript_data):
    """Processa a transcrição para extrair apenas o texto limpo e identificar vozes."""
    try:
        # Se transcript_data for uma string, tentar fazer parse do JSON
        if isinstance(transcript_data, str):
            # A ferramenta manus-speech-to-text retorna texto puro, não JSON
            main_text = transcript_data
            segments = [] # Não temos segmentos detalhados com esta ferramenta
        else:
            # Se for um objeto, converter para dict (fallback, mas não esperado aqui)
            data = transcript_data.model_dump() if hasattr(transcript_data, 'model_dump') else dict(transcript_data)
            main_text = data.get('text', '')
            segments = data.get('segments', [])
        
        if not segments:
            return clean_text(main_text)
        
        # Processar segmentos para identificar possíveis mudanças de voz (se houver)
        processed_text = ""
        current_voice = 1
        last_end_time = 0
        
        for i, segment in enumerate(segments):
            start_time = segment.get('start', 0)
            text = segment.get('text', '').strip()
            
            if not text:
                continue
            
            # Detectar possível mudança de voz baseada em pausas longas (>2 segundos)
            if start_time - last_end_time > 2.0 and i > 0:
                current_voice = 2 if current_voice == 1 else 1
            
            # Adicionar marcador de voz no início de novos parágrafos
            if i == 0 or start_time - last_end_time > 2.0:
                if processed_text and not processed_text.endswith('\n'):
                    processed_text += '\n'
                processed_text += f"[Voz{current_voice}] "
            
            processed_text += text + " "
            last_end_time = segment.get('end', start_time)
        
        # Identificar estruturas musicais
        final_text = identify_song_structure(clean_text(processed_text))
        return final_text
    
    except Exception as e:
        print(f"Erro ao processar transcrição: {e}")
        # Fallback: tentar extrair texto de qualquer forma
        if isinstance(transcript_data, str):
            return identify_song_structure(clean_text(transcript_data))
        elif hasattr(transcript_data, 'text'):
            return identify_song_structure(clean_text(transcript_data.text))
        else:
            return "Erro ao processar transcrição"

def clean_text(text):
    """Limpa e formata o texto da transcrição."""
    if not text:
        return "Transcrição não disponível"
    
    # Remover caracteres de controle e espaços extras
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Quebrar em parágrafos em pontos naturais
    text = re.sub(r'([.!?])\s+', r'\1\n\n', text)
    
    # Capitalizar início de frases
    sentences = text.split('\n\n')
    formatted_sentences = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if sentence:
            # Capitalizar primeira letra se não for um marcador de voz
            if not sentence.startswith('[Voz'):
                sentence = sentence[0].upper() + sentence[1:] if len(sentence) > 1 else sentence.upper()
            formatted_sentences.append(sentence)
    
    return '\n\n'.join(formatted_sentences)

def identify_song_structure(text):
    """Identifica e marca estruturas musicais no texto da transcrição."""
    if not text or len(text.strip()) < 20:
        return text
    
    # Dividir em seções baseadas em quebras de linha duplas
    sections = [s.strip() for s in text.split('\n\n') if s.strip()]
    
    if len(sections) < 2:
        return text
    
    # Analisar cada seção
    analyzed_sections = []
    section_similarities = []
    
    for i, section in enumerate(sections):
        # Limpar marcadores de voz para análise
        clean_section = re.sub(r'\[Voz\d+\]\s*', '', section).strip()
        
        # Calcular similaridade com outras seções
        similarities = []
        for j, other_section in enumerate(sections):
            if i != j:
                clean_other = re.sub(r'\[Voz\d+\]\s*', '', other_section).strip()
                similarity = calculate_similarity(clean_section, clean_other)
                similarities.append((j, similarity))
        
        section_similarities.append(similarities)
        analyzed_sections.append({
            'index': i,
            'text': section,
            'clean_text': clean_section,
            'word_count': len(clean_section.split()),
            'similarities': similarities
        })
    
    # Identificar estruturas
    structure_labels = identify_structures(analyzed_sections)
    
    # Aplicar labels
    final_sections = []
    for i, section in enumerate(sections):
        label = structure_labels.get(i, '')
        if label:
            final_sections.append(f"**[{label}]**\n{section}")
        else:
            final_sections.append(section)
    
    return '\n\n'.join(final_sections)

def calculate_similarity(text1, text2):
    """Calcula similaridade entre dois textos."""
    if not text1 or not text2:
        return 0.0
    
    # Normalizar textos
    text1 = re.sub(r'[^\w\s]', '', text1.lower())
    text2 = re.sub(r'[^\w\s]', '', text2.lower())
    
    # Usar SequenceMatcher para calcular similaridade
    return SequenceMatcher(None, text1, text2).ratio()

def identify_structures(sections):
    """Identifica as estruturas musicais baseado na análise das seções."""
    if not sections:
        return {}
    
    structure_labels = {}
    used_labels = set()
    
    # Identificar introdução (primeira seção, geralmente mais curta)
    if len(sections) > 0:
        first_section = sections[0]
        if first_section['word_count'] < 15:  # Seção curta
            structure_labels[0] = "INTRODUÇÃO"
            used_labels.add("INTRODUÇÃO")
    
    # Identificar refrões (seções que se repetem)
    chorus_candidates = []
    for i, section in enumerate(sections):
        if i in structure_labels:
            continue
            
        # Verificar se esta seção é similar a outras
        high_similarity_count = 0
        similar_sections = []
        
        for j, similarity in section['similarities']:
            if similarity > 0.7:  # Alta similaridade
                high_similarity_count += 1
                similar_sections.append(j)
        
        if high_similarity_count >= 1:  # Se tem pelo menos uma seção muito similar
            chorus_candidates.append({
                'index': i,
                'similarity_count': high_similarity_count,
                'similar_to': similar_sections,
                'word_count': section['word_count']
            })
    
    # Marcar refrões
    if chorus_candidates:
        # Ordenar por contagem de similaridade e tamanho
        chorus_candidates.sort(key=lambda x: (x['similarity_count'], x['word_count']), reverse=True)
        
        chorus_list = sorted(list(chorus_indices))
        for idx in chorus_list:
            structure_labels[idx] = "REFRÃO"
    
    # Identificar versos (seções que não são refrão nem introdução)
    verse_count = 1
    for i, section in enumerate(sections):
        if i not in structure_labels:
            # Verificar se pode ser uma ponte (seção única no meio)
            if len(sections) > 4 and i > 0 and i < len(sections) - 1:
                # Se está no meio e é diferente das outras
                is_unique = True
                for j, similarity in section['similarities']:
                    if similarity > 0.5:
                        is_unique = False
                        break
                
                if is_unique and section['word_count'] < 20:
                    structure_labels[i] = "PONTE"
                    continue
            
            # Caso contrário, é um verso
            structure_labels[i] = f"VERSO {verse_count}"
            verse_count += 1
    
    # Identificar outro/final (última seção se for diferente)
    if len(sections) > 1:
        last_idx = len(sections) - 1
        if last_idx not in structure_labels:
            last_section = sections[last_idx]
            
            # Se a última seção é muito diferente das outras
            is_outro = True
            for j, similarity in last_section['similarities']:
                if similarity > 0.6:
                    is_outro = False
                    break
            
            if is_outro and last_section['word_count'] < 15:
                structure_labels[last_idx] = "OUTRO/FINAL"
            elif last_idx not in structure_labels:
                structure_labels[last_idx] = f"VERSO {verse_count}"
    
    return structure_labels

