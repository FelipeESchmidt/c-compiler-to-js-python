const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const variableInitiators = [
  "int",
  "char",
  "float",
  "double",
  "short",
  "long",
  "unsigned int",
  "unsigned char",
  "unsigned short",
  "unsigned long",
  "_Bool",
];

const isStructInitiator = ({ type, value }) =>
  type === "Word" && value === "struct";

const isReturnInitiator = ({ type, value }) =>
  type === "Word" && value === "return";

const isVariableInitiator = ({ type, value }) =>
  type === "Word" &&
  variableInitiators.some((initiator) => initiator === value);
