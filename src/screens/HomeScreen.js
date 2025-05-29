import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import AppLayout from '../components/layout/AppLayout';
import { useSession } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';
import useAppTheme from '../hooks/useAppTheme';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Card, Title, Paragraph, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { currentUser } = useSession();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const [articles, setArticles] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = async () => {
    try {
      const articlesRef = collection(db, 'bai_viet');
      const q = query(articlesRef, orderBy('thoiGianTao', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      const articlesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(articlesList);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArticles();
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
  }, []);

  return (
    <AppLayout showBottomBar={true}>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.onSurface }]}>
            {currentUser ? `Xin chào, ${currentUser.tenTaiKhoan}` : 'Bạn chưa đăng nhập'}
          </Text>
          {currentUser?.vaiTroId === 1 && (
            <TouchableOpacity 
              style={[styles.adminButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AdminDashboard')}
            >
              <MaterialCommunityIcons name="view-dashboard" size={24} color="white" />
              <Text style={styles.adminButtonText}>Bảng điều khiển</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.newsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Tin tức mới nhất</Text>
          {articles.map((article) => (
            <TouchableOpacity 
              key={article.id}
              onPress={() => navigation.navigate('ArticleDetail', { article })}
            >
              <Card style={[styles.articleCard, { backgroundColor: colors.surface }]}>
                {article.anhDaiDien && (
                  <Card.Cover source={{ uri: article.anhDaiDien }} style={styles.articleImage} />
                )}
                <Card.Content>
                  <Title style={{ color: colors.onSurface }}>{article.tieuDe}</Title>
                  <Paragraph style={{ color: colors.onSurface }} numberOfLines={2}>
                    {article.moTa}
                  </Paragraph>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  adminButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newsContainer: {
    padding: 16,
  },
  articleCard: {
    marginBottom: 16,
    elevation: 2,
  },
  articleImage: {
    height: 200,
  },
});
