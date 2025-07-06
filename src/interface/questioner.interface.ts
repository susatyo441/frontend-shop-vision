export const questions = [
  "Seberapa intuitif dan mudah sistem ini untuk dioperasikan dalam alur kerja sehari-hari tanpa memerlukan bantuan?",
  "Seberapa cepat dan responsif sistem dalam menjalankan fungsinya (misalnya, mendeteksi produk, menampilkan hasil)?",
  "Seberapa akurat dan dapat diandalkan hasil yang diberikan oleh sistem? Apakah Anda percaya dengan output yang dihasilkan?",
  "Seberapa jelas, menarik, dan rapi tata letak visual dari antarmuka aplikasi? Apakah informasi mudah ditemukan?",
  "Apakah sistem memberikan pesan, status, atau umpan balik (feedback) yang jelas dan membantu Anda memahami apa yang sedang terjadi?",
  "Seberapa besar sistem ini membantu atau mempercepat proses checkout dibandingkan dengan input manual atau menggunakan barcode?",
];

export interface IQuestionerSummary {
  question1: number;
  question2: number;
  question3: number;
  question4: number;
  question5: number;
  question6: number;
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
