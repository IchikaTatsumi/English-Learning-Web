// src/lib/utils/string-similarity.ts

export function calculateAccuracy(target: string, spoken: string): number {
  // 1. Chuẩn hóa: Chuyển về chữ thường, bỏ dấu câu thừa
  const a = target.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const b = spoken.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

  // Nếu rỗng hoặc khớp tuyệt đối
  if (a === b) return 100;
  if (!a || !b) return 0;

  // 2. Thuật toán Levenshtein Distance (Đo khoảng cách chỉnh sửa giữa 2 chuỗi)
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // thay thế
          Math.min(matrix[i][j - 1] + 1, // chèn
          matrix[i - 1][j] + 1) // xóa
        ); 
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  
  // 3. Tính phần trăm giống nhau
  const accuracy = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
  return accuracy;
}