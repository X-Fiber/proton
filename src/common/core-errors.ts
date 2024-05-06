import { NExceptionProvider } from "~types";

export const CoreErrors = {
  SessionService: {
    INVALID_DATA_PAYLOAD: {
      code: "1100.1001",
      data: {
        message: "Invalid data format. Payload must be object",
      },
    },
    INVALID_DATA_STRUCTURE: {
      code: "1100.1002",
      data: {
        message:
          "Invalid data format. Payload must be contain event type and payload",
      },
    },
    INVALID_EVENT_TYPE: {
      code: "1100.1003",
      data: {
        message: `Invalid event type.`,
      },
    },
    SERVER_AUTHENTICATE_ERROR: (
      message: string
    ): NExceptionProvider.CoreErrorFormat => {
      return {
        code: "1100.1004",
        data: {
          message: message,
        },
      };
    },
  },
};
