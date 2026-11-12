declare global {
  interface Liveblocks {
    // Set by /api/liveblocks-auth. The user id is the name itself.
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar?: string;
        // Only on connected users, not on users resolved from comments
        browserId?: string;
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
