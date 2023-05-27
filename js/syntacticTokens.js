const basicSyntaticTokens = {
  dot: { type: "Dot" },
  name: { type: "Word" },
  hash: { type: "Macro" },
  colon: { type: "Colon" },
  star: { type: "Pointer" },
  percent: { type: "Modulo" },
  semi: { type: "Terminator" },
  comma: { type: "Delimiter" },
  question: { type: "Question" },
  string: { type: "StringLiteral" },
  number: { type: "NumberLiteral" },
  forwardslash: { type: "ForwardSlash" },
};

const doubleSyntaticTokens = {
  equal: { type: "Equal", value: "=" },
  equal_equal: { type: "ComparisonE", value: "==" },

  not: { type: "Not", value: "!" },
  not_equal: { type: "ComparisonN", value: "!=" },

  plus: { type: "Plus", value: "+" },
  plus_plus: { type: "IncByOne", value: "++" },
  plus_equal: { type: "IncByNum", value: "+=" },

  minus: { type: "Minus", value: "-" },
  minus_equal: { type: "DecByNum", value: "-=" },
  minus_minus: { type: "DecByOne", value: "--" },
  minus_greater: { type: "Arrow", value: "->" },

  less: { type: "Less", value: "<" },
  less_equal: { type: "LessOrEqual", value: "<=" },

  greater: { type: "Greater", value: ">" },
  greater_equal: { type: "GreaterOrEqual", value: ">=" },

  caret: { type: "Xor", value: "^" },
  caret_equal: { type: "XorEqual", value: "^=" },

  and: { type: "And", value: "&" },
  and_and: { type: "AndAnd", value: "&&" },

  pipe: { type: "Pipe", value: "|" },
  pipe_pipe: { type: "OrOr", value: "||" },
};

const backslashSyntaticTokens = {
  backslash_t: { type: "Tap", value: /\t/ },
  backslash_o: { type: "Oct", value: /\o/ },
  backslash_x: { type: "Hex", value: /\x/ },
  backslash_r: { type: "CRet", value: /\r/ },
  backslash_v: { type: "VTab", value: /\v/ },
  backslash_a: { type: "Alert", value: /\a/ },
  backslash_n: { type: "Newline", value: /\n/ },
  backslash_b: { type: "Backspace", value: /\b/ },
  backslash_question: { type: "QueMark", value: /\?/ },
};
