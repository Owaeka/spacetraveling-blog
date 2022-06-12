import Link from 'next/link';

import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={`${styles.header} ${commonStyles.container}`}>
      <Link href="/">
        <img
          src="/images/full-logo.svg"
          alt="logo"
          className={`${styles.img}`}
        />
      </Link>
    </header>
  );
}
