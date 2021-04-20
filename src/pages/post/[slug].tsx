/* eslint-disable react-hooks/rules-of-hooks */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Header from '../../components/Header';
import Comments from '../../components/Comments';

import { getPrismicClient } from '../../services/prismic';

import { getFormatedDate } from '../../utils/getFormatedDate';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  prevPost: {
    uid: string;
    title: string;
  };
  nextPost: {
    uid: string;
    title: string;
  };
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);

    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  const { isFallback } = useRouter();

  if (isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formattedDate = getFormatedDate(post.first_publication_date);

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <Header />

      <main className={styles.postContainer}>
        <div>
          <img src={post.data.banner.url} alt="banner" />

          <div className={commonStyles.container}>
            <h1>{post.data.title}</h1>
            <ul className={styles.headerPost}>
              <li>
                <FiCalendar />
                {formattedDate}
              </li>
              <li>
                <FiUser />
                {post.data.author}
              </li>
              <li>
                <FiClock />
                {`${readTime} min`}
              </li>
            </ul>

            {post.data.content.map(content => (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            ))}

            {/* <div
              className={`${styles.navigationPost} ${commonStyles.container}`}
            >
              {post.prevPost.uid && (
                <Link href={`/post/${post.prevPost.uid}`}>
                  <a>
                    <p>{post.prevPost.title}</p>
                    Post anterior
                  </a>
                </Link>
              )}

              {post.nextPost.uid && (
                <Link href={`/post/${post.nextPost.uid}`}>
                  <a className={styles.nextPost}>
                    <p>{post.nextPost.title}</p>
                    Próximo post
                  </a>
                </Link>
              )}
            </div> */}

            <Comments />

            {preview && (
              <aside>
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref || null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.first_publication_date]',
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      pageSize: 1,
      after: response.id,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    // prevPost: {
    //   uid: prevPost.results[0]?.uid ?? null,
    //   title: prevPost.results[0]?.data.title ?? null,
    // },
    // nextPost: {
    //   uid: nextPost?.results[0]?.uid ?? null,
    //   title: nextPost?.results[0]?.data.title ?? null,
    // },
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
    },
    revalidate: 60 * 30,
  };
};
