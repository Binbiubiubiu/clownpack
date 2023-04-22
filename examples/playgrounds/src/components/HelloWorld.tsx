import { Component, Prop, Vue } from 'vue-property-decorator';
import styles from './hello.module.css';

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  protected render() {
    return <div class={styles.a}>Hello world</div>;
  }
}
