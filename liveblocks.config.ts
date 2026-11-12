declare global {
  interface Liveblocks {
    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
      };
    };
    // Where a thread's pin sits on the image, as fractions (0 to 1) of the
    // image's width and height
    ThreadMetadata: {
      x: number;
      y: number;
    };
  }
}

export {};
