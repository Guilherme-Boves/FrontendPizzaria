import { createContext, ReactNode, useEffect, useState } from 'react'

import { api } from '../services/apiClient'
import {destroyCookie, setCookie, parseCookies} from 'nookies'
import Router from 'next/router'
import SignUp from '../pages/signup'
import { toast } from 'react-toastify'

type AuthContextData = {
    user: UserProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    signOut: () => void;
    signUp: (credentials: SignUpProps) => Promise<void>;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
}

type SignInProps = {
    email: string;
    password: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

type SignUpProps = {
    name: string;
    email: string;
    password: string;
}

export const AuthContext = createContext({} as AuthContextData)

export function signOut(){
    try{    
        destroyCookie(undefined, '@nextauth.token')
        Router.push('/')
    }catch{
        console.log("erro ao deslogar")
    }
}

export function AuthProvider({ children }: AuthProviderProps){
    
    const [user, setUser] = useState<UserProps>()
    const isAuthenticated = !!user;

    useEffect(() => {
        
        //Tentar pegar algo no cookie (TOKEN)
        const {'@nextauth.token': token} = parseCookies();

        if(token){
            api.get('/userinfo').then(response => {
                const { id, name, email} = response.data;

                setUser({
                    id,
                    name,
                    email
                })

            })
            .catch(() => {
                //Se deu erro, deslogamos o usuário
                signOut();
            })
        }

    }, [])

    async function signIn({ email, password }: SignInProps){
        try{
            const response = await api.post('/session', {
                email,
                password
            })

            //console.log(response.data);
            const {id, name, token} = response.data

            setCookie(undefined, '@nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, //Expirar em 1 mes
                path: "/" // Quais caminhos terão acesso ao cookie
            })

            setUser({
                id,
                name,
                email
            })

            // Passar para proximas requisições o nosso token
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            toast.success('Logado com sucesso!')

            // Redirecionar o user para /dashboard
            Router.push('/dashboard')


        }catch(err){
            toast.error("Erro ao acessar!")
            console.log("Erro ao acessar", err)
        }
    }

    async function signUp({name, email, password}: SignUpProps) {
        try{

            const response = await api.post('/users', {
                name,
                email,
                password
            })

            toast.success("Conta criada com sucesso!")

            Router.push('/');

        }catch(err){
            toast.error("Erro ao cadastrar!")
            console.log("Erro ao cadastrar", err)
        }

    }
    
    
    return(
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
            {children}
        </AuthContext.Provider>
    )
}