import { GetStaticProps } from 'next';
import { FiCalendar, FiUser } from 'react-icons/fi';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [pagination, setPagination] = useState(postsPagination);

  async function handleNextPage(): Promise<void> {
    if (!postsPagination.next_page) {
      return;
    }

    fetch(postsPagination.next_page)
      .then((res) => res.json())
      .then((json) => {
        const newPostLists: Post[] = json.results.map((post) => {
          const newPost: Post = {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
          return newPost;
        });

        const newPosts: Post[] = [];
        postsPagination.results.forEach((post) => newPosts.push(post));
        newPostLists.forEach((post) => newPosts.push(post));

        const newNextPage = json.next_page as string;

        const newPostPagination: PostPagination = {
          next_page: newNextPage,
          results: newPosts,
        };
        setPagination(newPostPagination);
      });
  }

  return (
    <>
      {pagination &&
        pagination.results?.map((post) => {
          const dataFormatada = format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          );
          return (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={`${styles.postsList} ${commonStyles.container}`}>
                <h1>{post.data.title}</h1>
                <h2>{post.data.subtitle}</h2>
                <div>
                  <FiCalendar />
                  <p>{dataFormatada}</p>
                  <FiUser />
                  <p>{post.data.author}</p>
                </div>
              </div>
            </Link>
          );
        })}

      {pagination.next_page != null ? (
        <div className={`${styles.load} ${commonStyles.container}`}>
          <button type="button" onClick={() => handleNextPage()}>
            Carregar mais posts
          </button>
        </div>
      ) : null}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('Publication', {
    orderings: {
      field: 'document.last_publication_date',
      direction: 'desc',
    },
    pageSize: 1,
    page: 1,
  });

  const posts = postsResponse.results.map((post) => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
  };
};
