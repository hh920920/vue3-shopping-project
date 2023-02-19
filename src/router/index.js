import {
    createRouter,
    createWebHistory
} from 'vue-router'
import { h } from 'vue'

const Home = () => import('@/views/home')
const Layout = () => import('@/Layout')
const TopCategory = () => import('@/views/category/index')
const SubCategory = () => import('@/views/category/sub')
const Goods = () => import('@/views/goods/index')
const Login = () => import('@/views/login/index')
const Register = () => import('@/views/register/index')
const Cart = () => import('@/views/cart/index')
const Member = () => import('@/views/member/index')
const MemberHome = () => import('@/views/member/home/index')
const UserInfo = () => import('@/views/member/home/components/home-info')
const UserSet = () => import('@/views/member/home/components/home-user-set')
const SysMessage = () => import('@/views/member/home/components/home-message')
const UserAddress = () => import('@/views/member/home/components/home-address')
const UserCollect = () => import('@/views/member/home/components/home-user-collect')


const MemberOrder = () => import('@/views/member/order')
const MemberOrderDetail = () => import('@/views/member/order/detail')


const Checkout = () => import('@/views/member/pay/checkout')
const Pay = () => import('@/views/member/pay/index')
const PayResult = () => import('@/views/member/pay/result')

const routes = [
    // 一级路由布局容器
    {
        path: '/',
        component: Layout,
        // 二级路由
        children: [
            { path: '/', component: Home },
            { path: '/category/:id', component: TopCategory },
            { path: '/category/sub/:id', component: SubCategory },
            { path: '/product/:id', component: Goods },
            { path: '/cart', component: Cart },
            { path: '/member/checkout', component: Checkout },
            { path: '/member/pay', component: Pay },
            { path: '/pay/callback', component: PayResult },
            // { path: '/member', component: Member },
            {
                path: '/member',
                component: Member,
                children: [
                    { path: '/member', component: MemberHome },
                    { path: '/user/info', component: UserInfo },
                    { path: '/user/set', component: UserSet },
                    { path: '/user/sysmessage', component: SysMessage },
                    { path: '/user/address', component: UserAddress },
                    { path: '/user/collect', component: UserCollect },
                ]
            },
            {
                path: '/member/order',
                // 创建一个RouterView容器形成嵌套关系
                // component: { render: () => h(<RouterView />) },
                component: Member,
                children: [
                    { path: '', component: MemberOrder },
                    { path: ':id', component: MemberOrderDetail }
                ]
            }
        ]
    },
    {
        path: '/user/register',
        component: Register,
    },
    {
        path: '/user/login',
        component: Login,
    }
]

// 导航守卫
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
// router.beforeEach((to, from, next) => {
//   if (to.path === '/login') {
//     next();
//   } else {
//     let token = localStorage.getItem('Authorization');

//     if (token === null || token === '') {
//       next('/login');
//     } else {
//       next();
//     }
//   }
// })


const router = createRouter({
    history: createWebHistory(),
    routes,
    // 路由延迟滚动
    // 每次切换路由时跳转到顶部
    scrollBehavior(to, from, savedPosition) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ left: 0, top: 0 })
            }, 500)
        })
    },
})


export default router