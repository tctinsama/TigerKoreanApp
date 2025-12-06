import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaderboard } from '../../services/leaderboardService';

const LeaderboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getLeaderboard();
      // Lấy tất cả data, không giới hạn
      setLeaderboard(data);
      // Start animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return '👑';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '🏅';
    }
  };

  const getRankColors = (index) => {
    switch (index) {
      case 0:
        return ['#FBBF24', '#F59E0B', '#D97706']; // Yellow gradient
      case 1:
        return ['#D1D5DB', '#9CA3AF', '#6B7280']; // Silver gradient
      case 2:
        return ['#FB923C', '#F97316', '#EA580C']; // Orange/Bronze gradient
      default:
        return ['#60A5FA', '#3B82F6', '#2563EB']; // Blue gradient
    }
  };

  const getXPBarWidth = (xp) => {
    const maxXP = Math.max(...leaderboard.map((u) => u.totalXP), 1);
    return Math.max((xp / maxXP) * 100, 10);
  };

  const getTopThreeArranged = () => {
    const withIndex = leaderboard.map((item, i) => ({ ...item, originalIndex: i }));
    if (withIndex.length < 3) return withIndex;
    return [
      { ...withIndex[1], originalIndex: 1 },
      { ...withIndex[0], originalIndex: 0 },
      { ...withIndex[2], originalIndex: 2 },
      ...withIndex.slice(3),
    ];
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B35', '#FF8C61']}
          style={styles.header}
        >
          <View style={styles.headerTop} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
            <Text style={styles.headerSubtitle}>Top 5 học viên</Text>
          </View>
          <View style={styles.headerSpacer} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingTitle}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B35', '#FF8C61']}
          style={styles.header}
        >
          <View style={styles.headerTop} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
            <Text style={styles.headerSubtitle}>Top 5 học viên</Text>
          </View>
          <View style={styles.headerSpacer} />
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏆</Text>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu</Text>
          <Text style={styles.emptyText}>Hãy bắt đầu học để leo hạng!</Text>
        </View>
      </View>
    );
  }

  const arrangedList = getTopThreeArranged();
  const top3 = arrangedList.slice(0, 3);
  const top4And5 = arrangedList.slice(3, 5);

  const currentUserName = user?.fullName;
  
  // Tìm vị trí user hiện tại
  const currentUserIndex = currentUserName
    ? arrangedList.findIndex((item) => item.fullName === currentUserName)
    : -1;
  const currentUser = currentUserIndex !== -1 ? arrangedList[currentUserIndex] : null;
  
  // Kiểm tra xem user có nằm trong top 5 không
  const isUserInTop5 = currentUserIndex >= 0 && currentUserIndex < 5;
  
  // Chỉ hiển thị user riêng nếu họ không nằm trong top 5
  const showCurrentUserSeparately = currentUser && !isUserInTop5;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8C61']}
        style={styles.header}
      >
        <View style={styles.headerTop} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏆 Bảng xếp hạng</Text>
          <Text style={styles.headerSubtitle}>{leaderboard.length} học viên</Text>
        </View>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{leaderboard.length}</Text>
            <Text style={styles.statLabel}>Học viên</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{leaderboard[0]?.totalXP?.toLocaleString() || 0}</Text>
            <Text style={styles.statLabel}>XP cao nhất</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🚀</Text>
            <Text style={styles.statValue}>
              {currentUserIndex >= 0 ? `#${currentUserIndex + 1}` : '-'}
            </Text>
            <Text style={styles.statLabel}>Hạng của bạn</Text>
          </View>
        </View>

        {/* Top 3 Podium */}
        {top3.length === 3 && (
          <View style={styles.podiumSection}>
            <View style={styles.podiumContainer}>
              {/* Rank 2 - Left */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumCard, top3[0].fullName === currentUserName && styles.currentUserPodium]}>
                  <View style={[styles.podiumBadge, styles.silverBadge]}>
                    <Text style={styles.podiumRank}>2</Text>
                  </View>
                  {top3[0].fullName === currentUserName && (
                    <View style={styles.youBadgePodium}>
                      <Text style={styles.youBadgePodiumText}>Bạn</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: top3[0].currentBadge }}
                    style={styles.podiumAvatar}
                    defaultSource={require('../../../assets/icon.png')}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[0].fullName}
                  </Text>
                  <View style={styles.podiumTitleBadge}>
                    <Text style={styles.podiumTitleText} numberOfLines={1}>
                      {top3[0].currentTitle}
                    </Text>
                  </View>
                  <Text style={styles.podiumXP}>{top3[0].totalXP.toLocaleString()}</Text>
                  <Text style={styles.podiumXPLabel}>XP</Text>
                  {/* XP Progress Bar */}
                  <View style={styles.podiumProgressBar}>
                    <LinearGradient
                      colors={['#C0C0C0', '#9CA3AF']}
                      style={[styles.podiumProgressFill, { width: `${(top3[0].totalXP / leaderboard[0].totalXP) * 100}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                <View style={[styles.podiumBase, styles.silverBase]}>
                  <Text style={styles.podiumBaseIcon}>🥈</Text>
                </View>
              </View>

              {/* Rank 1 - Center */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumCard, styles.goldCard, top3[1].fullName === currentUserName && styles.currentUserPodium]}>
                  <View style={[styles.podiumBadge, styles.goldBadge]}>
                    <Text style={styles.podiumRank}>1</Text>
                  </View>
                  {top3[1].fullName === currentUserName && (
                    <View style={styles.youBadgePodium}>
                      <Text style={styles.youBadgePodiumText}>Bạn</Text>
                    </View>
                  )}
                  <View style={styles.crownContainer}>
                    <Text style={styles.crownIcon}>👑</Text>
                  </View>
                  <Image
                    source={{ uri: top3[1].currentBadge }}
                    style={[styles.podiumAvatar, styles.goldAvatar]}
                    defaultSource={require('../../../assets/icon.png')}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[1].fullName}
                  </Text>
                  <View style={styles.podiumTitleBadge}>
                    <Text style={styles.podiumTitleText} numberOfLines={1}>
                      {top3[1].currentTitle}
                    </Text>
                  </View>
                  <Text style={[styles.podiumXP, styles.goldXP]}>
                    {top3[1].totalXP.toLocaleString()}
                  </Text>
                  <Text style={styles.podiumXPLabel}>XP</Text>
                  {/* XP Progress Bar */}
                  <View style={styles.podiumProgressBar}>
                    <LinearGradient
                      colors={['#FFD700', '#FFA500']}
                      style={[styles.podiumProgressFill, { width: '100%' }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                <View style={[styles.podiumBase, styles.goldBase]}>
                  <Text style={styles.podiumBaseIcon}>🏆</Text>
                </View>
              </View>

              {/* Rank 3 - Right */}
              <View style={styles.podiumItem}>
                <View style={[styles.podiumCard, top3[2].fullName === currentUserName && styles.currentUserPodium]}>
                  <View style={[styles.podiumBadge, styles.bronzeBadge]}>
                    <Text style={styles.podiumRank}>3</Text>
                  </View>
                  {top3[2].fullName === currentUserName && (
                    <View style={styles.youBadgePodium}>
                      <Text style={styles.youBadgePodiumText}>Bạn</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: top3[2].currentBadge }}
                    style={styles.podiumAvatar}
                    defaultSource={require('../../../assets/icon.png')}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {top3[2].fullName}
                  </Text>
                  <View style={styles.podiumTitleBadge}>
                    <Text style={styles.podiumTitleText} numberOfLines={1}>
                      {top3[2].currentTitle}
                    </Text>
                  </View>
                  <Text style={styles.podiumXP}>{top3[2].totalXP.toLocaleString()}</Text>
                  <Text style={styles.podiumXPLabel}>XP</Text>
                  {/* XP Progress Bar */}
                  <View style={styles.podiumProgressBar}>
                    <LinearGradient
                      colors={['#CD7F32', '#8B4513']}
                      style={[styles.podiumProgressFill, { width: `${(top3[2].totalXP / leaderboard[0].totalXP) * 100}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                </View>
                <View style={[styles.podiumBase, styles.bronzeBase]}>
                  <Text style={styles.podiumBaseIcon}>🥉</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Hạng 4 & 5 */}
        {top4And5.length > 0 && (
          <View style={styles.listSection}>
            <Text style={styles.listTitle}>Hạng 4 & 5</Text>
            {top4And5.map((item, index) => {
              const isCurrentUser = item.fullName === currentUserName;
              const actualRank = item.originalIndex + 1;
              
              return (
                <Animated.View
                  key={item.originalIndex}
                  style={[
                    styles.rankCard,
                    isCurrentUser && styles.currentUserCard,
                    { opacity: fadeAnim },
                  ]}
                >
                  <View style={styles.rankLeft}>
                    <View style={[styles.rankNumber, isCurrentUser && styles.currentUserRank]}>
                      <Text style={[styles.rankNumberText, isCurrentUser && styles.currentUserRankText]}>
                        {actualRank}
                      </Text>
                    </View>
                    <Image
                      source={{ uri: item.currentBadge }}
                      style={[styles.rankAvatar, isCurrentUser && styles.currentUserAvatar]}
                      defaultSource={require('../../../assets/icon.png')}
                    />
                    <View style={styles.rankInfo}>
                      <Text style={[styles.rankName, isCurrentUser && styles.currentUserName]} numberOfLines={1}>
                        {item.fullName}
                        {isCurrentUser && <Text style={styles.youTag}> (Bạn)</Text>}
                      </Text>
                      <View style={styles.rankTitleContainer}>
                        <Text style={styles.rankTitle} numberOfLines={1}>
                          {item.currentTitle}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rankRight}>
                    <Text style={[styles.rankXP, isCurrentUser && styles.currentUserXP]}>
                      {item.totalXP.toLocaleString()}
                    </Text>
                    <Text style={styles.rankXPLabel}>XP</Text>
                    {/* Mini Progress Bar */}
                    <View style={styles.miniProgressBar}>
                      <LinearGradient
                        colors={isCurrentUser ? ['#FF6B35', '#FF8C61'] : ['#60A5FA', '#9333EA']}
                        style={[styles.miniProgressFill, { width: `${(item.totalXP / leaderboard[0].totalXP) * 100}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Vị trí của user hiện tại (ngoài top 5) */}
        {showCurrentUserSeparately && (
          <View style={styles.currentUserSection}>
            <Text style={styles.currentUserSectionTitle}>Vị trí của bạn</Text>
            <Animated.View
              style={[
                styles.rankCard,
                styles.currentUserCard,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.rankLeft}>
                <View style={[styles.rankNumber, styles.currentUserRank]}>
                  <Text style={[styles.rankNumberText, styles.currentUserRankText]}>
                    {currentUser.originalIndex + 1}
                  </Text>
                </View>
                <Image
                  source={{ uri: currentUser.currentBadge }}
                  style={[styles.rankAvatar, styles.currentUserAvatar]}
                  defaultSource={require('../../../assets/icon.png')}
                />
                <View style={styles.rankInfo}>
                  <Text style={[styles.rankName, styles.currentUserName]} numberOfLines={1}>
                    {currentUser.fullName}
                    <Text style={styles.youTag}> (Bạn)</Text>
                  </Text>
                  <View style={styles.rankTitleContainer}>
                    <Text style={styles.rankTitle} numberOfLines={1}>
                      {currentUser.currentTitle}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.rankRight}>
                <Text style={[styles.rankXP, styles.currentUserXP]}>
                  {currentUser.totalXP.toLocaleString()}
                </Text>
                <Text style={styles.rankXPLabel}>XP</Text>
                {/* Mini Progress Bar */}
                <View style={styles.miniProgressBar}>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C61']}
                    style={[styles.miniProgressFill, { width: `${(currentUser.totalXP / leaderboard[0].totalXP) * 100}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Motivational Message */}
        <View style={styles.motivationSection}>
          <LinearGradient
            colors={['#FF6B35', '#FF8C61']}
            style={styles.motivationCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.motivationIcon}>🎉</Text>
            <Text style={styles.motivationTitle}>Chúc mừng tất cả!</Text>
            <Text style={styles.motivationText}>
              Tiếp tục phấn đấu để leo hạng cao hơn! 🚀
            </Text>
          </LinearGradient>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerTop: {
    height: 30,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // Podium Section
  podiumSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
  },
  podiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goldCard: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFEF7',
    transform: [{ scale: 1.05 }],
  },
  currentUserPodium: {
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  youBadgePodium: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 20,
  },
  youBadgePodiumText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  podiumBadge: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  goldBadge: {
    backgroundColor: '#FFD700',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
  },
  podiumRank: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  crownContainer: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
  },
  crownIcon: {
    fontSize: 24,
  },
  podiumAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  goldAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  podiumTitleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  podiumTitleText: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  podiumXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  goldXP: {
    fontSize: 18,
    color: '#FFD700',
  },
  podiumXPLabel: {
    fontSize: 10,
    color: '#999',
  },
  podiumProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  podiumProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  podiumBase: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  goldBase: {
    backgroundColor: '#FFD700',
    height: 50,
  },
  silverBase: {
    backgroundColor: '#C0C0C0',
    height: 40,
  },
  bronzeBase: {
    backgroundColor: '#CD7F32',
    height: 35,
  },
  podiumBaseIcon: {
    fontSize: 20,
  },
  // List Section
  listSection: {
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  rankCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F2',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentUserRank: {
    backgroundColor: '#FF6B35',
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  currentUserRankText: {
    color: '#FFFFFF',
  },
  rankAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  currentUserAvatar: {
    borderColor: '#FF6B35',
    borderWidth: 2,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currentUserName: {
    color: '#FF6B35',
  },
  youTag: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#FF6B35',
  },
  rankTitleContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rankTitle: {
    fontSize: 10,
    color: '#666',
  },
  rankRight: {
    alignItems: 'flex-end',
  },
  rankXP: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  currentUserXP: {
    fontSize: 18,
  },
  rankXPLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
  },
  miniProgressBar: {
    width: 80,
    height: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  // Current User Section (outside top 5)
  currentUserSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  currentUserSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  // Motivation Section
  motivationSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  motivationCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  motivationIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
});

export default LeaderboardScreen;
