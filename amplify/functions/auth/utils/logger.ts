/* Backend module imports */
import { getISOString } from "@backend/utils/time-calculations";

/* Writes an error line to the logs */
export const logError = ({ title, data }: {
  title: string;
  data?: Record<string, unknown>;
}) => {
  console.error(title, {
    timestamp: getISOString(),
    ...data,
  });
};

/* Writes an info line to the logs */
export const logInfo = ({ title, data }: {
  title: string;
  data?: Record<string, unknown>;
}) => {
  console.info(title, {
    timestamp: getISOString(),
    ...data,
  });
};
