declare module "*.css" {
  // Bất kỳ tệp CSS nào được import sẽ được coi là module hợp lệ.
  // Điều này cho phép TypeScript bỏ qua và chuyển giao việc xử lý cho Webpack/Next.js.
  const content: any;
  export default content;
}