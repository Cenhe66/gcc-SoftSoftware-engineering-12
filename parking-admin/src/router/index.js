import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      public: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '数据大屏'
        }
      },
      {
        path: 'parking',
        name: 'ParkingManage',
        component: () => import('@/views/ParkingManage.vue'),
        meta: {
          title: '停车场管理'
        }
      },
      {
        path: 'records',
        name: 'RecordManage',
        component: () => import('@/views/RecordManage.vue'),
        meta: {
          title: '停车记录'
        }
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('@/views/UserManage.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'settings',
        name: 'Setting',
        component: () => import('@/views/Setting.vue'),
        meta: {
          title: '系统设置'
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: {
          title: '个人中心'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - 智能停车管理系统'
  }

  // 登录权限校验
  if (!to.meta.public) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }

  next()
})

export default router
