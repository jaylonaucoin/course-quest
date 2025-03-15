import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Divider,
  useTheme,
  Text,
  Icon,
  Menu,
  RadioButton,
} from 'react-native-paper';
import { getUser, getRounds } from '../utils/DataController';

export default function AccountScreen({ navigation }) {
  const [user, setUser] = useState({});
  const [rounds, setRounds] = useState([]);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sort, setSort] = useState('date-desc');

  useEffect(() => {
    getUser().then((user) => {
      setUser(user);
    });
    getRounds().then((rounds) => {
      setRounds(rounds);
    });
  }, []);
  const theme = useTheme();

  const changeSort = async (value) => {
    setSortMenuVisible(false);
    setSort(value);
    const sortedRounds = await getRounds(value);
    setRounds(sortedRounds);
  };

  const ListHeader = () => {
    return (
      <View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginBottom: 10,
          }}>
          <View style={{ borderRadius: 100, marginRight: 5 }}>
            {user.profilePicture ? (
              <Avatar.Image size={60} source={{ uri: user.profilePicture }} />
            ) : (
              <Avatar.Image
                size={60}
                style={{
                  marginHorizontal: 10,
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                }}
                source={() => <Icon source="account" color={theme.colors.onPrimary} size={45} />}
              />
            )}
          </View>
          <Text variant="headlineMedium">{user.firstName + ' ' + user.lastName}</Text>
        </View>
        <Card>
          <Card.Content>
            <Text variant="titleMedium">
              Home Course: <Text variant="titleMedium">{user.homeCourse}</Text>
            </Text>
            <Text variant="titleSmall">Location: Nova Scotia, Canada</Text>
            <Divider style={{ marginVertical: 10 }} bold={true} />
            <Text variant="bodySmall">{user.bio}</Text>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => navigation.navigate('EditAccount')}>Edit Profile</Button>
            </View>
          </Card.Content>
        </Card>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="titleLarge" style={{ marginVertical: 10 }}>
            Recent Rounds
          </Text>
          <Menu
            visible={sortMenuVisible}
            anchor={
              <Button
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                contentStyle={{ flexDirection: 'row-reverse' }}
                children="Sort"
              />
            }
            onDismiss={() => setSortMenuVisible(false)}
            style={{ marginTop: 45, marginRight: 50 }}>
            <RadioButton.Group onValueChange={(value) => changeSort(value)} value={sort}>
              <RadioButton.Item label="Date (desc)" value="date-desc" />
              <RadioButton.Item label="Date (asc)" value="date-asc" />
              <RadioButton.Item label="Score (desc)" value="score-desc" />
              <RadioButton.Item label="Score (asc)" value="score-asc" />
            </RadioButton.Group>
          </Menu>
        </View>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <FlatList
        style={{ padding: 15, height: '100%' }}
        data={rounds}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <Card
            style={{
              margin: 5,
              paddingVertical: 5,
              backgroundColor: theme.colors.elevation.level2,
            }}>
            <Card.Title
              title={item.course}
              subtitle={item.date
                .toDate()
                .toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              left={() => (
                <Avatar.Text
                  labelStyle={{ fontSize: 17, fontWeight: 'bold', color: theme.colors.onPrimary }}
                  style={{ borderRadius: 12 }}
                  size={55}
                  label={item.score}
                />
              )}
              leftStyle={{ marginRight: 30 }}
              titleVariant="titleMedium"
            />
          </Card>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
