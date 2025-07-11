export const questions = [
  "Seberapa mudah sistem ini untuk dioperasikan?",
  "Seberapa cepat sistem dalam menjalankan fungsinya (misalnya, mendeteksi produk, menampilkan hasil)?",
  "Seberapa akurat dan dapat diandalkan hasil yang diberikan oleh sistem?",
  "Apakah Anda percaya dengan output yang dihasilkan?",
  "Seberapa jelas, menarik, dan rapi tata letak visual dari antarmuka aplikasi?",
  "Apakah informasi mudah ditemukan?",
  "Apakah sistem memberikan pesan, status, atau umpan balik (feedback) yang jelas dan membantu Anda memahami apa yang sedang terjadi?",
  "Seberapa besar sistem ini membantu pekerjaan Anda dibandingkan dengan metode sebelumnya?",
  "Seberapa sering anda menemukan bug dalam sistem ini?",
  "Menurut Anda, seberapa efektif fitur deteksi produk otomatis dalam mempercepat proses transaksi di kasir?",
];

export interface IQuestionerSummary {
  question1: number;
  question2: number;
  question3: number;
  question4: number;
  question5: number;
  question6: number;
  question7: number;
  question8: number;
  question9: number;
  question10: number;
  average: number;
  name: string;
  totalAnswer: number;
}

export interface ITester {
  _id: string;
  questionerId: string;
  name: string;
  instagram?: string;
}
