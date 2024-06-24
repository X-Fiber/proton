export const defaultConfig = {
  services: {
    logger: {
      enable: true,
      loggers: {
        core: true,
        schema: true,
      },
      transports: {
        console: {
          core: {
            enable: true,
            level: "verbose",
          },
          schema: {
            enable: true,
            level: "debug",
          },
        },
      },
    },
    scrambler: {
      enable: false,
      salt: 5,
      secret: "default",
      randomBytes: 10,
      accessExpiredAt: 10,
      refreshExpiredAt: 30,
      defaultAlgorithm: "MD5",
    },
    scheduler: {
      enable: false,
      maxTask: "no-validate",
      periodicity: 1000,
      workers: {
        minWorkers: "max",
        maxWorkers: 1,
        maxQueueSize: undefined,
        workerType: "auto",
        workerTerminateTimeout: 1000,
      },
    },
    manager: {
      enable: false,
      secret: "",
      connect: {
        protocol: "http",
        host: "0.0.0.0",
        port: 11008,
      },
      communicationUrl: "v1/call/cli",
      users: [
        {
          name: "Admin",
          permissions: "All" as "All",
        },
      ],
    },
  },
};
