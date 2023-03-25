import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld";

@Component({
  components: {
    HelloWorld,
  },
})
export default class App extends Vue {
  protected render() {
    return (
      <div>
        <HelloWorld />
        1212
      </div>
    );
  }
}
