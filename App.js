import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import {
  PaperProvider,
  Appbar,
  Surface,
  Text,
  Button,
  MD3LightTheme,
} from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
  },
};

// Layout dos botões: cada linha é uma lista de botões.
// "flex" permite que um botão ocupe mais espaço (ex.: o zero).
const ROWS = [
  [
    { label: 'C', type: 'action' },
    { label: '⌫', type: 'action' },
    { label: '±', type: 'action' },
    { label: '÷', type: 'operator' },
  ],
  [
    { label: '7' },
    { label: '8' },
    { label: '9' },
    { label: '×', type: 'operator' },
  ],
  [
    { label: '4' },
    { label: '5' },
    { label: '6' },
    { label: '-', type: 'operator' },
  ],
  [
    { label: '1' },
    { label: '2' },
    { label: '3' },
    { label: '+', type: 'operator' },
  ],
  [
    { label: '0', flex: 2 },
    { label: ',' },
    { label: '=', type: 'equals' },
  ],
];

const calculate = (a, b, op) => {
  const x = parseFloat(a);
  const y = parseFloat(b);
  switch (op) {
    case '+':
      return x + y;
    case '-':
      return x - y;
    case '×':
      return x * y;
    case '÷':
      return y === 0 ? null : x / y;
    default:
      return y;
  }
};

const format = (n) => {
  if (n === null || !isFinite(n)) return 'Erro';
  return String(parseFloat(n.toFixed(10)));
};

export default function App() {
  // Hooks de estado
  const [current, setCurrent] = useState('0'); // valor mostrado no display
  const [previous, setPrevious] = useState(null); // primeiro operando
  const [operator, setOperator] = useState(null); // operador escolhido
  const [overwrite, setOverwrite] = useState(false); // próximo dígito substitui o display?
  const [expression, setExpression] = useState(''); // linha pequena acima do display

  const clearAll = () => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setOverwrite(false);
    setExpression('');
  };

  const inputDigit = (d) => {
    if (current === 'Erro' || overwrite) {
      setCurrent(d);
      setOverwrite(false);
      if (current === 'Erro') setExpression('');
      return;
    }
    setCurrent(current === '0' ? d : current + d);
  };

  const inputDot = () => {
    if (current === 'Erro' || overwrite) {
      setCurrent('0.');
      setOverwrite(false);
      return;
    }
    if (!current.includes('.')) setCurrent(current + '.');
  };

  const backspace = () => {
    if (current === 'Erro' || overwrite) return;
    setCurrent(current.length > 1 ? current.slice(0, -1) : '0');
  };

  const toggleSign = () => {
    if (current === 'Erro' || current === '0') return;
    setCurrent(current.startsWith('-') ? current.slice(1) : '-' + current);
  };

  const chooseOperator = (op) => {
    if (current === 'Erro') return;

    // Permite encadear: 2 + 3 + ... calcula 2 + 3 antes de seguir
    if (operator && previous !== null && !overwrite) {
      const result = format(calculate(previous, current, operator));
      if (result === 'Erro') {
        setCurrent('Erro');
        setPrevious(null);
        setOperator(null);
        setExpression('');
        setOverwrite(true);
        return;
      }
      setPrevious(result);
      setCurrent(result);
      setExpression(`${result} ${op}`);
    } else {
      setPrevious(current);
      setExpression(`${current} ${op}`);
    }
    setOperator(op);
    setOverwrite(true);
  };

  const equals = () => {
    if (!operator || previous === null || current === 'Erro') return;
    const result = format(calculate(previous, current, operator));
    setExpression(`${previous} ${operator} ${current} =`);
    setCurrent(result);
    setPrevious(null);
    setOperator(null);
    setOverwrite(true);
  };

  const handlePress = (label) => {
    if (/^\d$/.test(label)) return inputDigit(label);
    switch (label) {
      case ',':
        return inputDot();
      case 'C':
        return clearAll();
      case '⌫':
        return backspace();
      case '±':
        return toggleSign();
      case '=':
        return equals();
      default:
        return chooseOperator(label);
    }
  };

  const getButtonStyle = (type) => {
    switch (type) {
      case 'operator':
        return { mode: 'contained-tonal', color: undefined };
      case 'equals':
        return { mode: 'contained', color: undefined };
      case 'action':
        return { mode: 'contained-tonal', color: theme.colors.errorContainer };
      default:
        return { mode: 'outlined', color: undefined };
    }
  };

  const displayText = current.replace('.', ',');
  const fontSize = displayText.length > 12 ? 28 : displayText.length > 8 ? 40 : 56;

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.Content title="Calculadora" />
        </Appbar.Header>

        {/* Display */}
        <Surface style={styles.display} elevation={2}>
          <Text variant="titleMedium" style={styles.expression}>
            {expression.replace(/\./g, ',')}
          </Text>
          <Text
            style={[styles.value, { fontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayText}
          </Text>
        </Surface>

        {/* Teclado */}
        <View style={styles.keypad}>
          {ROWS.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((btn) => {
                const { mode, color } = getButtonStyle(btn.type);
                return (
                  <Button
                    key={btn.label}
                    mode={mode}
                    onPress={() => handlePress(btn.label)}
                    style={[
                      styles.button,
                      { flex: btn.flex || 1 },
                      color && { backgroundColor: color },
                    ]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                  >
                    {btn.label}
                  </Button>
                );
              })}
            </View>
          ))}
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  display: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    minHeight: 130,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  expression: {
    color: '#79747E',
    minHeight: 24,
  },
  value: {
    fontWeight: '300',
    color: '#1C1B1F',
  },
  keypad: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  button: {
    margin: 4,
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonContent: {
    height: '100%',
  },
  buttonLabel: {
    fontSize: 24,
  },
});

