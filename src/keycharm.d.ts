declare module 'keycharm' {
    interface KeycharmOptions {
      preventDefault?: boolean;
      stopPropagation?: boolean;
      container?: HTMLElement | null;
    }
  
    interface Keycharm {
      bind(key: string | string[], callback: (event?: KeyboardEvent) => void, type?: string): void;
      unbind(key: string | string[], callback?: (event?: KeyboardEvent) => void): void;
      reset(): void;
      destroy(): void;
    }
  
    function keycharm(options?: KeycharmOptions): Keycharm;
  
    export default keycharm;
  }