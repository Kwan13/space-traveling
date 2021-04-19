import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { GetStaticProps } from 'next';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { getFormatedDate } from '../utils/getFormatedDate';

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
  const { results, next_page } = postsPagination;

  const formattedPost = results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: getFormatedDate(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleMorePosts(): Promise<void> {
    if (nextPage === null) {
      return;
    }

    const postResponse = await fetch(`${nextPage}`).then(response => {
      return response.json();
    });

    const newPost = postResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: getFormatedDate(post.first_publication_date),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setNextPage(postResponse.next_page);
    setPosts([...posts, ...newPost]);
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <Header />

      <main className={commonStyles.container}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <ul>
                <li>
                  <FiCalendar />
                  {post.first_publication_date}
                </li>
                <li>
                  <FiUser />
                  {post.data.author}
                </li>
              </ul>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button
            type="button"
            className={styles.nextPostButton}
            onClick={handleMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30,
  };
};
