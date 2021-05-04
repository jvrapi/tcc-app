import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { CustomTabBar } from '../components';
import BottomTabBarContext from '../contexts/bottomTabBar';
import Profile from './profile.routes';
import Treatment from '../screens/Treatment';
import Annotations from './annotations.routes';
import Home from './home.routes';
import Exam from './exam.routes';
import Disease from './disease.routes';
const Tab = createBottomTabNavigator();
const AppRoutes: React.FC = () => {
  const { showTabBar } = useContext(BottomTabBarContext);
  return (
    <Tab.Navigator tabBar={props => showTabBar && <CustomTabBar {...props} />}>
      <Tab.Screen name='Home' component={Home} />
      <Tab.Screen name='Annotations' component={Annotations} />
      <Tab.Screen name='Treatment' component={Treatment} />
      <Tab.Screen name='Profile' component={Profile} />
      <Tab.Screen name='Exam' component={Exam} />
      <Tab.Screen name='Disease' component={Disease} />
    </Tab.Navigator>
  );
};

export default AppRoutes;
