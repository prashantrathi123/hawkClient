export const isValidFolderName = (name) => {
  const validFolderNameRegex = /^(?!^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9]|CLOCK\$|CONFIG\$|..)$)(?!.*[<>:"/\\|?*\s]{2,})(?![. ])(?:[^<>:"/\\|?*\s]+(?: [^<>:"/\\|?*\s]+)*)?(?<![. ])$/;
  return !validFolderNameRegex.test(name);
}
