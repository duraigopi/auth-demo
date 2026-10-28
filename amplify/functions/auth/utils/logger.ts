/* Backend module imports */
import { getISOString } from "@backend/utils/time-calculations";

/* Title format is [MODULE-ACTION]: Description, so logs can be searched by module */
export const logError = ({ title, data }: {
  title: string;
  data?: Record<string, unknown>;
}) => {
  console.error(title, {
    timestamp: getISOString(),
    ...data,
  });
};

export const logInfo = ({ title, data }: {
  title: string;
  data?: Record<string, unknown>;
}) => {
  console.info(title, {
    timestamp: getISOString(),
    ...data,
  });
};
