
import librosa
import pyloudnorm as pyln
import numpy as np
import soundfile as sf

def analyze_audio_features(audio_path):
    try:
        # Carregar o arquivo de áudio
        data, rate = sf.read(audio_path)

        # Se o áudio for estéreo, converter para mono para análise
        if data.ndim > 1:
            data = librosa.to_mono(data.T)

        # Análise de LUFS
        meter = pyln.Meter(rate) # Criar medidor BS.1770
        loudness = meter.integrated_loudness(data)

        # Análise de Espectro de Frequência (usando STFT do librosa)
        # Compute the Short-Time Fourier Transform (STFT)
        stft = np.abs(librosa.stft(data))
        # Compute the magnitude spectrogram
        spectrogram = librosa.amplitude_to_db(stft, ref=np.max)

        # Para simplificar, vamos pegar a média do espectro de frequência
        # Isso pode ser expandido para retornar mais detalhes do espectro
        mean_spectrum = np.mean(spectrogram, axis=1)

        # Análise de BPM
        tempo, beat_frames = librosa.beat.beat_track(y=data, sr=rate)

        # Análise de Key (tom)
        # Usar chroma_stft para extrair características de croma
        chroma = librosa.feature.chroma_stft(y=data, sr=rate)
        # Estimar o tom usando o algoritmo de Krumhansl-Schmuckler
        # Isso requer um modelo de perfis de tom, que librosa não inclui diretamente
        # Uma abordagem mais simples é encontrar o pico no espectro de croma
        # Para uma estimativa mais robusta, pode-se usar um classificador treinado
        # Por simplicidade, vamos usar a nota de croma mais proeminente
        pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        key_index = np.argmax(np.sum(chroma, axis=1))
        key = pitches[key_index]

        # Retornar os resultados
        return {
            "lufs": round(loudness.item(), 2),
            "bpm": round(tempo.item()),
            "key": key,
            "mean_frequency_spectrum": mean_spectrum.tolist() # Converter para lista para JSON
        }
    except Exception as e:
        print(f"Erro ao analisar áudio: {e}")
        return None

