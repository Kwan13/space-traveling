/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Component, ReactElement } from 'react';

import styles from './comments.module.scss';

export default class Comments extends Component<ReactElement> {
  componentDidMount() {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', 'true');
    script.setAttribute('repo', 'Kwan13/space-traveling');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-dark');
    anchor.appendChild(script);
  }

  render() {
    return (
      <div className={styles.container} id="inject-comments-for-uterances" />
    );
  }
}
