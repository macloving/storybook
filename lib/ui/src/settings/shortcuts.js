import React, { Component } from 'react';
import { Icons, Router } from '@storybook/components';
import { setAll, setItem } from './persist';
import {
  defaultShortcutSets,
  serializableKeyboardShortcuts,
  initShortcutKeys,
  isSetEqual,
  labelsArr,
  mapToKeyEl,
  parseKey,
  serializedLocalStorage,
} from './utils';
import {
  A,
  Button,
  ColWrapper,
  Container,
  Description,
  Footer,
  GridHeaderRow,
  GridWrapper,
  Heading,
  Header,
  HeaderItem,
  SuccessIcon,
  CenteredRow,
  HotKeyWrapper,
  Main,
  KeyInputWrapper,
  Row,
  Title,
  TextInput,
  TitleText,
  Wrapper,
} from './components';

class ShortcutsPage extends Component {
  constructor(props) {
    super(props);
    const shortcuts = initShortcutKeys();

    this.state = {
      activeInputField: '',
      inputValue: [],
      successField: '',
      shortcutKeys: serializedLocalStorage(shortcuts),
    };
  }

  duplicateFound = () => {
    const { inputValue, shortcutKeys } = this.state;
    const match = Object.entries(shortcutKeys).filter(i => isSetEqual(inputValue, i[1]));
    return !!match.length;
  };

  onKeyDown = e => {
    const { inputValue, shortcutKeys, activeInputField } = this.state;

    const parsedKey = parseKey(e)[0];
    this.setState({
      inputValue: [...inputValue, parsedKey],
      shortcutKeys: {
        ...shortcutKeys,
        [activeInputField]: { value: [...inputValue, parsedKey], error: false },
      },
    });
  };

  onFocus = focusedInput => () => {
    const { shortcutKeys } = this.state;
    this.setState({
      activeInputField: focusedInput,
      inputValue: [],
      shortcutKeys: { ...shortcutKeys, [focusedInput]: { value: [], error: false } },
    });
  };

  onBlur = () => {
    const { shortcutKeys, activeInputField } = this.state;
    if (shortcutKeys[activeInputField].value.length === 0) {
      return this.restoreDefault(activeInputField);
    }
    this.saveShortcut(activeInputField);
    return this.setState({ inputValue: [], activeInputField: '' });
  };

  saveShortcut = activeInputField => {
    const { inputValue, shortcutKeys } = this.state;

    if (this.duplicateFound()) {
      return this.setState({
        shortcutKeys: { ...shortcutKeys, [activeInputField]: { error: true } },
      });
    }

    this.setState({
      successField: activeInputField,
      shortcutKeys: { ...shortcutKeys, [activeInputField]: { value: inputValue, error: false } },
    });
    return setItem('shortcutKeys', activeInputField, inputValue);
  };

  restoreDefaults = () => {
    this.setState({ shortcutKeys: serializedLocalStorage(serializableKeyboardShortcuts) });
    setAll('shortcutKeys', serializableKeyboardShortcuts);
  };

  restoreDefault = keyToReset => {
    const { shortcutKeys } = this.state;
    this.setState({
      shortcutKeys: { ...shortcutKeys, [keyToReset]: defaultShortcutSets[keyToReset] },
    });
    setItem('shortcutKeys', keyToReset, serializableKeyboardShortcuts[keyToReset]);
  };

  renderStateKeys = stateVal => () => {
    const { shortcutKeys } = this.state;
    const shortcut = shortcutKeys[stateVal];

    return mapToKeyEl(shortcut.value);
  };

  displaySuccessMessage = activeElement => {
    const { successField, shortcutKeys } = this.state;
    return activeElement === successField && shortcutKeys[activeElement].error === false
      ? 'success'
      : '';
  };

  renderKeyInput = () => {
    const { shortcutKeys } = this.state;
    const arr = Object.entries(shortcutKeys).map((shortcut, i) => (
      <Row key={`${shortcut[0]}`}>
        <Description>{`${labelsArr[i]}`}</Description>
        <KeyInputWrapper>
          <HotKeyWrapper>
            <CenteredRow>{this.renderStateKeys(shortcut[0])()}</CenteredRow>
            <TextInput
              maxLength={3}
              className="modalInput"
              onBlur={this.onBlur}
              onFocus={this.onFocus(shortcut[0])}
              onKeyDown={this.onKeyDown}
              value={shortcutKeys[shortcut[0]].value}
            />
          </HotKeyWrapper>
        </KeyInputWrapper>

        <SuccessIcon colorTheme={this.displaySuccessMessage(shortcut[0])}>
          <Icons height={20} icon="check" />
        </SuccessIcon>
      </Row>
    ));
    return arr;
  };

  renderKeyForm = () => (
    <GridWrapper>
      <GridHeaderRow>
        <HeaderItem>Commands</HeaderItem>
        <HeaderItem>Shortcut</HeaderItem>
      </GridHeaderRow>
      {this.renderKeyInput()}
    </GridWrapper>
  );

  render() {
    const layout = this.renderKeyForm();
    return (
      <Router.Route path="shortcuts">
        <Container>
          <Wrapper>
            <Title>
              <TitleText>Keyboard Shortcuts</TitleText>
            </Title>
          </Wrapper>
          <ColWrapper>
            <Main>
              <Heading>
                <Header>
                  <Button id="restoreDefaultsHotkeys" onClick={this.restoreDefaults}>
                    Restore Defaults
                  </Button>
                </Header>
              </Heading>
              {layout}
            </Main>
          </ColWrapper>
          <Wrapper>
            <Footer>
              <A href="https://storybook.js.org">Storybook docs</A>
              <A href="https://github.com/storybooks/storybook">GitHub</A>
              <A href="https://storybook.js.org/support">Support</A>
            </Footer>
          </Wrapper>
        </Container>
      </Router.Route>
    );
  }
}

export default ShortcutsPage;