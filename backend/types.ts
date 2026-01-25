export type Env = {
  Variables: {
    user: {
      _id: string;
      username: string;
      email: string;
      type: "EventUser" | "Vendor" | "Guest";
    };
  };
};
