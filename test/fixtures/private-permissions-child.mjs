import { ensurePrivateDirectory } from "../../src/server/private-files.mjs";

try {
  ensurePrivateDirectory(process.env.NANODUCK_TEST_PRIVATE_DIRECTORY);
  process.stdout.write("ok");
} catch (error) {
  process.stderr.write(error.message);
  process.exitCode = 1;
}
