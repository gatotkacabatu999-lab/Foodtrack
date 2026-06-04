import { createApp } from "./app";

(async () => {
  const { app, server } = await createApp();

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(`serving on port ${port}`);
    },
  );
})();
