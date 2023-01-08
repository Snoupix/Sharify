import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "ca459x",
  port: 3030,
  e2e: {
    //testIsolation: false,
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
