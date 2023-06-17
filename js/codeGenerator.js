const classLineTransform = (line) => {
  line.value.pop();
  line.value.shift();
  const variableName = line.value.map((lv) => lv.value).join(" ");
  return `${gtt("classPropDefinition")}.${variableName} = ''`;
};

const mountIfCondition = (lineIf) => {
  return lineIf.condition.map((lIf) => lIf.value).join(" ");
};

const mountBlockCondition = (lineBlock) => {
  return lineBlock.condition.map((lBl) => lBl.value).join(" ");
};

const mountForCondition = (lineFor) => {
  const forCondition = gtt("forCondition");
  if (!forCondition)
    return lineFor.condition.map((lFor) => lFor.value).join(" ");

  const variableName = lineFor.condition[0].value;
  const endFor = lineFor.condition.at(-4).value;
  return forCondition(variableName, endFor);
};

const functionCalleeTransform = (functionCallee) => {
  if (functionCallee.callee === "printf") {
    if (functionCallee.params[0].type === "StringLiteral") {
      const printableString = functionCallee.params.shift().value;
      const variables = functionCallee.params.reduce((acc, currentItem) => {
        if (currentItem.type === "Word" || currentItem.type === "Dot") {
          acc[acc.length - 1] += currentItem.value;
        } else if (currentItem.type === "Delimiter") {
          acc.push("");
        }
        return acc;
      }, []);
      const replaced = printableString.replace(
        /%[a-zA-Z]/g,
        () => `${gtt("printVarInit")}${variables.shift()}${gtt("printVarEnd")}`
      );
      return `${gtt("printFunc")}(${gtt("printStringStart")}${replaced}${gtt(
        "printStringEnd"
      )})`;
    }
  }
  if (functionCallee.callee === "scanf") {
    const type = functionCallee.params.shift().value;
    const variable = functionCallee.params.pop().value;

    const scanFunction = gtt("scanFunc");
    if (scanFunction) {
      return `${variable} = ${scanFunction(type)}`;
    }

    switch (type) {
      case "%d":
        return `${variable} = ${Math.floor(Math.random() * 100)}`;

      case "%f":
        return `${variable} = ${Math.random() * 100}`;

      default:
        return `${variable} = "${Array.from({ length: 10 })
          .map(() =>
            characters.charAt(Math.floor(Math.random() * characters.length))
          )
          .join("")}"`;
    }
  }

  const parsedParams = functionCallee.params.map((param) => {
    if (param.type == "StringLiteral")
      return { ...param, value: `"${param.value}"` };
    return param;
  });

  return `${functionCallee.callee}(${parsedParams
    .map((param) => param.value)
    .join("")})`;
};

let tabs = -1;

const preLineTransform = (line) => {
  tabs++;
  const t = Array.from({ length: tabs })
    .map(() => "\t")
    .join("");

  const lineTransformed = lineTransform(line);
  tabs--;
  return `${t}${lineTransformed}`;
};

const lineTransform = (line) => {
  if (line.type === "Macro") {
    return `${gtt("comment")}${line.subtype} "${line.file}.${gtt(
      "extension"
    )}"`;
  }
  if (line.type === "Define") {
    const isString = line.variableType === "StringLiteral";
    const aroundValueChar = isString ? `"` : "";
    return `${gtt("constInit")}${line.variable} = ${aroundValueChar}${
      line.variableValue
    }${aroundValueChar}`;
  }
  if (line.type === "Statement") {
    line.value.pop();
    const firstStatementItem = line.value[0];
    const isClassInitiator = isStructInitiator(firstStatementItem);
    const isStringInitiator = isVariableInitiator(firstStatementItem);
    const isReturn = isReturnInitiator(firstStatementItem);
    const stringInitiator = isStringInitiator ? `${gtt("varInit")}` : "";

    if (isStringInitiator || isClassInitiator) line.value.shift();

    if (isClassInitiator) {
      const variableName = line.value.pop().value;
      return `${gtt("varInit")}${variableName} = ${gtt("classInitiator")}${
        line.value[0].value
      }()`;
    }

    if (isReturn) {
      return `${line.value.map((lv) => lv.value).join(" ")}`;
    }

    const variables = line.value
      .map((lv) => gstt(lv.type) || lv.value)
      .join("")
      .split(",")
      .map(gtt("excludeEmptyDefinition"))
      .filter((item) => !!item)
      .join(gtt("varSeparator"));

    return variables ? `${stringInitiator}${variables}` : "";
  }
  if (line.type === "Struct") {
    return [
      `class ${line.name} ${gtt("classInitStructure")}`,
      `\t${gtt("classConstructor")(line.name)}${gtt("classInitStructure")}`,
      ...line.body.map((l) => `\t\t${classLineTransform(l)}`),
      `\t${gtt("classEndStructure")}`,
      `${gtt("classEndStructure")}`,
    ].join("\n");
  }
  if (line.type === "if") {
    return [
      `if (${mountIfCondition(line)})${gtt("ifInitStructure")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("ifEndStructure")}`,
    ].join("\n");
  }
  if (line.type === "elseif") {
    return [
      `${gtt("elseIf")} (${mountIfCondition(line)})${gtt("ifInitStructure")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("ifEndStructure")}`,
    ].join("\n");
  }
  if (line.type === "else") {
    return [
      `else${gtt("ifInitStructure")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("ifEndStructure")}`,
    ].join("\n");
  }
  if (line.type === "for") {
    return [
      `for ${gtt("forConditionStart")}${mountForCondition(line)}${gtt(
        "forConditionEnd"
      )} ${gtt("forBlockInit")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("forBlockEnd")}`,
    ].join("\n");
  }
  if (line.type === "while") {
    return [
      `while (${mountBlockCondition(line)}) ${gtt("whileBlockInit")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("whileBlockEnd")}`,
    ].join("\n");
  }
  if (line.type === "do") {
    if (gtt("doException")) throw gtt("doException");
    return [
      `do ${gtt("doBlockInit")}`,
      ...line.body.map((l) => `\t${preLineTransform(l)}`),
      `${gtt("doBlockEnd")} while(${mountBlockCondition(line)})`,
    ].join("\n");
  }
  if (line.type === "Call") {
    return functionCalleeTransform(line);
  }
  console.log(line);
  return "";
};

const functionTransform = (f) => {
  const functionLines = [
    `${gtt("funcInit")} ${f.name} ${gtt("funcMid")} (${f.args
      .map((fArgs) => fArgs.name)
      .join(",")}) ${gtt("funcBlockInit")}`,
    ...f.body.map((l) => `\t${preLineTransform(l)}`),
    `${gtt("funcBlockEnd")}`,
  ];

  return functionLines;
};

const codeGenerator = ([globalStatements, functions]) => {
  const codeLines = [];

  globalStatements.body.forEach((line) => {
    codeLines.push(preLineTransform(line));
  });

  functions.body.forEach((f) => {
    codeLines.push(...functionTransform(f));
  });

  return codeLines.join("\n");
};
