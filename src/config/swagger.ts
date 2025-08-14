import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CitiZen API",
      version: "1.0.0",
      description:
        "A comprehensive API for citizen engagement and government services",
      contact: {
        name: "CitiZen API Support",
        email: "support@citizen-api.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.citizen.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login/signup endpoints",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/swagger/*.swagger.ts"],
};

export const specs = swaggerJsdoc(options);
