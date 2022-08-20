
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

// Função para páginas que só pode ser acessadas por visitantes
export function canSSRGuest<P>(fn: GetServerSideProps<P>) {

    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

    const cookies = parseCookies(ctx);

    // Se o usuário tentar acessar a página de login ou de cadastro, porém está logado, iremos redireciona-lo 
    if(cookies['@nextauth.token']){
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false,
            }
        }
    }



        return await fn(ctx);
    }
}