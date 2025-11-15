/**
 * Utilitários para comparação e normalização de acordes
 */

/**
 * Normaliza um acorde para comparação
 * Remove espaços, converte para minúsculas e padroniza formatos
 */
export function normalizeChord(chord: string): string {
  if (!chord) return '';
  
  // Converter para minúsculas e remover espaços
  let normalized = chord.toLowerCase().trim();
  
  // Remover espaços extras
  normalized = normalized.replace(/\s+/g, '');
  
  // Normalizar formato "C:maj" -> "C" (remover dois pontos e maj)
  normalized = normalized.replace(/[:;]/g, '');
  
  // Normalizar variações comuns de acordes menores
  // "emin" -> "em", "e-minor" -> "em", "e minor" -> "em"
  normalized = normalized.replace(/minor|min|-minor|-min/g, 'm');
  
  // Normalizar variações de acordes maiores
  // "emajor" -> "e", "e-major" -> "e", "e major" -> "e", "cmaj" -> "c", "c:maj" -> "c"
  normalized = normalized.replace(/major|maj|-major|-maj/g, '');
  
  // Remover parênteses e outros caracteres especiais
  normalized = normalized.replace(/[()]/g, '');
  
  return normalized;
}

/**
 * Compara dois acordes e retorna true se forem equivalentes
 * 
 * Exemplos de correspondências:
 * - "Em" = "Emin" = "E minor" = "emin"
 * - "C" = "C major" = "Cmaj"
 * - "Am" = "Amin" = "A minor"
 */
export function compareChords(chord1: string, chord2: string): boolean {
  if (!chord1 || !chord2) return false;
  
  const normalized1 = normalizeChord(chord1);
  const normalized2 = normalizeChord(chord2);
  
  // Comparação exata após normalização
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Comparação parcial (um contém o outro)
  // Útil para casos como "Em" vs "Emin" ou "C" vs "Cmaj"
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    // Verificar se não é um falso positivo
    // Ex: "Em" não deve corresponder a "E" (maior)
    const base1 = normalized1.replace(/m$/, '');
    const base2 = normalized2.replace(/m$/, '');
    
    // Se as bases são iguais, verificar se ambos são menores ou ambos são maiores
    if (base1 === base2) {
      const isMinor1 = normalized1.endsWith('m') && !normalized1.endsWith('maj');
      const isMinor2 = normalized2.endsWith('m') && !normalized2.endsWith('maj');
      return isMinor1 === isMinor2;
    }
    
    // Se um contém o outro e as bases são diferentes, pode ser válido
    // Ex: "Em" contém "E" mas são diferentes (menor vs maior)
    // Neste caso, não correspondem
    return false;
  }
  
  return false;
}

/**
 * Verifica se um acorde detectado corresponde ao acorde esperado
 * Retorna true se corresponder, false caso contrário
 */
export function isChordMatch(detectedChord: string, expectedChord: string): boolean {
  if (!detectedChord || !expectedChord) {
    return false;
  }
  
  return compareChords(detectedChord, expectedChord);
}

