import React, { useState, useRef, useEffect, useContext } from 'react';
import styled from 'styled-components/native';

import { Image, Input, Button } from '../components';

import { images } from '../utils/images';

import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { validateEmail, removeWhitespace } from '../utils/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Alert } from 'react-native';
import { login } from '../utils/firebase';

import { ProgressContext, UserContext } from '../contexts';
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.background};
  padding: 0 20px;
  padding-top: ${({ insets: { top } }) => top}px;
  padding-bottom: ${({ insets: { bottom } }) => bottom}px;
`;

const ErrorText = styled.Text`
  align-items: flex-start;
  width: 100%;
  height: 20px;
  margin-bottom: 10px;
  line-height: 20px;
  color: ${({ theme }) => theme.errorText};
`;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginDisabled, setLoginDisabled] = useState(true);

  const passwordRef = useRef();

  const { spinner } = useContext(ProgressContext);
  const { dispatch } = useContext(UserContext);

  const [errorMessage, setErrorMessage] = useState('');
  const _handleEmailChange = email => {
    const changeEmail = removeWhitespace(email);
    setEmail(changeEmail);
    setErrorMessage(validateEmail(changeEmail) ? '' : 'Please verify your email');
  };
  const _handlePasswordChange = password => {
    setPassword(removeWhitespace(password));
  };

  const _handleLoginButtonPress = async () => {
    try {
      spinner.start();
      const user = await login({ email, password });
      console.log(user);
      Alert.alert('Login Success', user.email);
      dispatch(user);
    } catch (e) {
      Alert.alert('Login error', e.message);
    } finally {
      spinner.end();
    }
  };

  useEffect(() => {
    console.log(!(email && password && !errorMessage));
    setLoginDisabled(!(email && password && !errorMessage));
  }, [email, password, errorMessage]);

  const insets = useSafeAreaInsets();

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }} extraScrollHeight={120}>
      <Container insets={insets}>
        <Image url={images.logo} imageStyle={{ borderRadius: 8 }} />
        <Input
          label="Email"
          value={email}
          onChangeText={_handleEmailChange}
          onSubmitEditing={() => passwordRef.current.focus()}
          placeholder="Email"
          returnKeyType="next"
        />
        <Input
          label="Password"
          ref={passwordRef}
          value={password}
          onChangeText={_handlePasswordChange}
          onSubmitEditing={_handleLoginButtonPress}
          placeholder="Password"
          returnKeyType="done"
          isPassword
        />
        <Button title="Login" onPress={_handleLoginButtonPress} disabled={loginDisabled} />
        <Button title="SignUp with email" onPress={() => navigation.navigate('Signup')} isFilled={false} />
        <ErrorText>{errorMessage}</ErrorText>
      </Container>
    </KeyboardAwareScrollView>
  );
};
export default Login;
