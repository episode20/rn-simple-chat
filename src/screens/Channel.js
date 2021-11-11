import React, { useState, useEffect, useLayoutEffect, useContext } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { FlatList, Text } from 'react-native';
import { DB, createMessage, getCurrentUser } from '../utils/firebase';
import { getDocs, query, where, startAt, getDoc, doc, orderBy, collection } from 'firebase/firestore';
import { Input } from '../components';

import { Alert } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import { MaterialIcons } from '@expo/vector-icons';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const SendButton = props => {
  const theme = useContext(ThemeContext);

  return (
    <Send
      {...props}
      disabled={!props.text}
      containerStyle={{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
      }}>
      <MaterialIcons name="send" size={24} color={props.text ? theme.sendButtonActivate : theme.sendButtonInactivate} />
    </Send>
  );
};

const Channel = ({ navigation, route: { params } }) => {
  const theme = useContext(ThemeContext);
  const { uid, name, photoUrl } = getCurrentUser();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const _handleMessageSend = async messageList => {
    const newMessage = messageList[0];
    try {
      await createMessage({ channelId: params.id, message: newMessage });
    } catch (e) {
      Alert.alert('Send Message Error', e.message);
    }
  };

  useEffect(() => {
    async function fetchMsgData() {
      // You can await here
      // const msgCollection = await collection(DB, 'channels');
      // const docRef = doc(DB, "channels", params.id);

      const msgCollection = await collection(DB, 'channels/' + params.id + '/messages');
      const q = query(msgCollection, orderBy('createdAt', 'desc'));
      const docSnap2 = await getDocs(q);

      const msglList = [];
      docSnap2.forEach(doc => {
        const item = {
          _id: doc.id,
          text: doc.data().text,
          user: doc.data().user,
          createAt: doc.data().createAt,
        };
        // doc.data() is never undefined for query doc snapshots
        console.log(item);
        msglList.push(item);
      });

      console.log('결과');
      console.log(msglList);
      setMessages(msglList);
      setIsLoading(true);
      // const citiesRef = doc(DB, "channels/", params.id);
      // const docSnap = await getDoc(citiesRef);

      // if (docSnap.exists()) {
      //     console.log("Document data:", docSnap.data());
      //   } else {
      //     // doc.data() will be undefined in this case
      //     console.log("No such document!");
      // }

      // const q = query(citiesRef, orderBy("createdAt"), startAt(docSnap));
      // const docSnap2 = await getDocs(q);
      // const channelList = [];
      // console.log('틀어왔나?')
      // docSnap2.forEach((doc) => {
      //     const item = {
      //         id: doc.id,
      //         data: doc.data()
      //     }
      //     // doc.data() is never undefined for query doc snapshots
      //     console.log(doc.id, " => ", doc.data());
      //     channelList.push(item);
      // });

      // const q = query(collection(DB, "channels"), where("id", "==", params.id));
      // const docSnap = await getDocs(q);
      // console.log('틀어왔나?')
      // console.log(docSnap)

      // const channelList = [];
      // docSnap2.forEach((doc) => {
      //     const item = {
      //         id: doc.id,
      //         data: doc.data()
      //     }
      //     // doc.data() is never undefined for query doc snapshots
      //     console.log(doc.id, " => ", doc.data());
      //     channelList.push(item);
      // });

      // ...
      // const channelList = chSnapshot.docs.map(doc => doc.data());
      // const msglList = [];
      // chSnapshot.forEach((doc) => {
      //     const item = {
      //         id: doc.id,
      //         data: doc.data()
      //     }
      //     // doc.data() is never undefined for query doc snapshots
      //     console.log(doc.id, " => ", doc.data());
      //     msglList.push(item);
      // });

      // console.log(msglList)
      // setMessages(msglList);
      // return docRef;
    }
    const list = fetchMsgData();
    // return () => msgCollection();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: params.title || 'Channel' });
  }, []);

  console.log('--------------------------------------------------------------------------------');
  console.log(photoUrl);
  console.log(name);
  console.log(uid);
  console.log(messages);
  console.log('--------------------------------------------------------------------------------');

  return (
    <Container>
      {/* <FlatList
                keyExtractor={item => item['id']}
                data={messages}
                renderItem={({ item }) => (
                    <Text style={{ fontSize: 24 }}>{item.data.text}</Text>
                )}
                inverted={true}
            />
            <Input value={text}
                onChangeText={text => setText(text)}
                onSubmitEditing={() => createMessage({channelId: params.id, text})}
            /> */}

      {isLoading && (
        <GiftedChat
          listViewProps={{
            style: { backgroundColor: theme.background },
          }}
          placeholder="enter a message..."
          messages={messages}
          user={{ _id: uid, name, avatar: photoUrl }}
          onSend={_handleMessageSend}
          alwaysShowSend={true}
          textInputProps={{
            autoCapitalize: 'none',
            autoCorrect: false,
            textContentType: 'none',
            underlineColorAndroid: 'transparent',
          }}
          multiline={false}
          renderUsernameOnMessage={true}
          scrollToBottom={true}
          renderSend={props => <SendButton {...props} />}
        />
      )}
    </Container>
  );
};

export default Channel;
