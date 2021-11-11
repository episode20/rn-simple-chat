import React, { useContext, useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { DB } from '../utils/firebase';

import { getDocs, collection } from 'firebase/firestore';
import moment from 'moment';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  border-bottom-width: 1px;
  border-color: ${({ theme }) => theme.listBorder};
  padding: 15px 20px;
`;

const ItemTextContainer = styled.View`
  flex: 1;
  flex-direction: column;
`;

const ItemTitle = styled.Text`
  font-size: 20px;
  font-weight: 600;
`;

const ItemDescription = styled.Text`
  font-size: 16px;
  margin-top: 5px;
  color: ${({ theme }) => theme.listTime};
`;

const ItemTime = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.listTime};
`;

const getDateOrTime = ts => {
  const now = moment().startOf('day');
  const target = moment(ts).startOf('day');

  return moment(ts).format(now.diff(target, 'days') > 0 ? 'MM/DD' : 'HH:mm');
};

const Item = React.memo(
  ({
    item: {
      id,
      data: { title, description, createAt },
    },
    onPress,
  }) => {
    const theme = useContext(ThemeContext);
    console.log(`Item: ${id}`);

    return (
      <ItemContainer onPress={() => onPress({ id, title })}>
        <ItemTextContainer>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemTextContainer>
        <ItemTime>{getDateOrTime(createAt)}</ItemTime>
        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme.listIcon} />
      </ItemContainer>
    );
  },
);

const ChannelList = ({ navigation }) => {
  const [channels, setChannles] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // You can await here
      console.log('testsdlfkajs;lfdkjas;lkdfj');
      const channelCol = await collection(DB, 'channels');
      const chSnapshot = await getDocs(channelCol);
      // ...
      // const channelList = chSnapshot.docs.map(doc => doc.data());
      const channelList = [];
      chSnapshot.forEach(doc => {
        const item = {
          id: doc.id,
          data: doc.data(),
        };
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, ' => ', doc.data());
        channelList.push(item);
      });

      console.log(channelList);
      setChannles(channelList);
      return channelCol;
    }
    const channelCol = fetchData();
    // return () => channelCol();
    // 1. 조회
    // const channelCol =  await collection(DB, 'channels');
    // const chSnapshot =  await getDocs(channelCol);
    // const channelList = chSnapshot.docs.map(doc => doc.data());
    // const unsubscribe = collection( DB, 'channels')
    //     .orderBy('createAt', 'desc')
    //     .onSnapshot(snapshot => {
    //         const list = [];
    //         snapshot.forEach(doc => {
    //             list.push(doc.data());
    //         });
    //         setChannles(list);
    //     })
    // return () => unsubscribe();
  }, []);

  const _handleItemPress = params => {
    navigation.navigate('Channel', params);
  };
  return (
    <Container>
      <FlatList
        keyExtractor={item => item['id']}
        data={channels}
        renderItem={({ item }) => <Item item={item} onPress={_handleItemPress} />}
        windowSize={3}
      />
    </Container>
  );
};

export default ChannelList;
