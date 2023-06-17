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

const pythonScanByType = (type) => {
  const types = {
    "%d": "int(input())",
    "%f": "float(input())",
    "%s": "input()",
  };

  return types[type];
};

const getTranslationToken = (token, language = "py") => {
  return translationTokens[token][language];
};

const getSafeTranslationToken = (token) => {
  if (!translationTokens[token]) return;
  return getTranslationToken(token);
};

const gtt = getTranslationToken;
const gstt = getSafeTranslationToken;

const translationTokens = {
  constInit: {
    js: "const ",
    py: "",
  },
  varInit: {
    js: "let ",
    py: "",
  },
  varSeparator: {
    js: ",",
    py: ";",
  },
  excludeEmptyDefinition: {
    js: (v) => v,
    py: (v) => (v.includes("=") ? v : ""),
  },
  funcInit: {
    js: "const ",
    py: "def ",
  },
  funcMid: {
    js: "=",
    py: "",
  },
  funcBlockInit: {
    js: "=> {",
    py: ":",
  },
  funcBlockEnd: {
    js: "}",
    py: "",
  },
  elseIf: {
    js: "else if",
    py: "elif",
  },
  ifInitStructure: {
    js: "{",
    py: ":",
  },
  ifEndStructure: {
    js: "}",
    py: "",
  },
  classConstructor: {
    js: (name) => `${name}()`,
    py: () => "def __init__(self)",
  },
  classInitStructure: {
    js: "{",
    py: ":",
  },
  classEndStructure: {
    js: "}",
    py: "",
  },
  classPropDefinition: {
    js: "this",
    py: "self",
  },
  classInitiator: {
    js: "new ",
    py: "",
  },
  printFunc: {
    js: "console.log",
    py: "print",
  },
  printVarInit: {
    js: "${",
    py: "{",
  },
  printVarEnd: {
    js: "}",
    py: "}",
  },
  printStringStart: {
    js: "`",
    py: "f'",
  },
  printStringEnd: {
    js: "`",
    py: "'",
  },
  scanFunc: {
    js: null,
    py: (type) => pythonScanByType(type),
  },
  forCondition: {
    js: null,
    py: (variable, end) => `${variable} in range(${end})`,
  },
  forConditionStart: {
    js: "(",
    py: "",
  },
  forConditionEnd: {
    js: ")",
    py: "",
  },
  forBlockInit: {
    js: "{",
    py: ":",
  },
  forBlockEnd: {
    js: "}",
    py: "",
  },
  whileBlockInit: {
    js: "{",
    py: ":",
  },
  whileBlockEnd: {
    js: "}",
    py: "",
  },
  doException: {
    js: null,
    py: new TypeError("Do while não existe em python!"),
  },
  doBlockInit: {
    js: "{",
    py: "",
  },
  doBlockEnd: {
    js: "}",
    py: "",
  },
  comment: {
    js: "//",
    py: "#",
  },
  extension: {
    js: "js",
    py: "py",
  },

  IncByOne: {
    js: "",
    py: "+= 1",
  },
  DecByOne: {
    js: "",
    py: "-= 1",
  },
};
