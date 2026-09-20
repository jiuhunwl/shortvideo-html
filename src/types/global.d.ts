export {};
declare global {
  interface Window {
    Swiper?: new (
      selector: string,
      options: Record<string, unknown>,
    ) => { destroy: () => void };
  }
}
