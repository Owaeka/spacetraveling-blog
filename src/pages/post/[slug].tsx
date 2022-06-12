import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
    banner: {
      url: string;
    };
    content: {
      heading: string;
      body: {
        type: string;
        text: string;
        spans: string[];
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const dataFormatada = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );
  return (
    <>
      <div className={styles.image}>
        <img src={post.data.banner.url} alt="" />
      </div>
      <article className={`${styles.post} ${commonStyles.container}`}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <div>
            <FiCalendar />
            <time>{dataFormatada}</time>
          </div>
          <div>
            <FiUser />
            <p>{post.data.author}</p>
          </div>
          <div>
            <FiClock />
            <p>4 min</p>
          </div>
        </div>
        {post.data.content &&
          post.data.content.map((content) => {
            return (
              <main key={content.heading} className={styles.postContent}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </main>
            );
          })}
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('Publication');

  const slugs = posts.results.map((post) => post.uid);
  const pathsReturn = slugs.map((slug) => {
    const path = {
      params: {
        slug,
      },
    };
    return path;
  });

  console.log('esse teste tá todo sem sentido, rocketseat');
  console.log(pathsReturn);

  return {
    paths: [
      { params: { slug: 'como-utilizar-hooks' } },
      { params: { slug: 'criando-um-app-cra-do-zero' } },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('Publication', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: new Date(
      response.first_publication_date
    ).toString(),
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
