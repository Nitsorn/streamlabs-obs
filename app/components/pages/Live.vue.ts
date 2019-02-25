import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import SceneSelector from 'components/SceneSelector.vue';
import Mixer from 'components/Mixer.vue';
import { UserService } from 'services/user';
import { Inject } from 'util/injector';
import Display from 'components/shared/Display.vue';
import { CustomizationService } from 'services/customization';
import VTooltip from 'v-tooltip';
import { $t, I18nService } from 'services/i18n';
import { NavigationService } from 'services/navigation';
import { Debounce } from 'lodash-decorators';
import ResizeBar from 'components/shared/ResizeBar.vue';

Vue.use(VTooltip);
VTooltip.options.defaultContainer = '#mainWrapper';

@Component({
  components: {
    SceneSelector,
    Mixer,
    Display,
    ResizeBar,
  },
})
export default class Live extends Vue {
  @Inject() userService: UserService;
  @Inject() customizationService: CustomizationService;
  @Inject() i18nService: I18nService;
  @Inject() navigationService: NavigationService;

  $refs: {
    webview: Electron.WebviewTag;
  };

  enablePreviewTooltip = $t('Enable the preview stream');
  disablePreviewTooltip = $t('Disable the preview stream, can help with CPU');

  mounted() {
    I18nService.setWebviewLocale(this.$refs.webview);

    this.$refs.webview.addEventListener('new-window', e => {
      const match = e.url.match(/dashboard\/([^\/^\?]*)/);

      if (match && match[1] === 'recent-events') {
        this.popout();
      } else if (match) {
        this.navigationService.navigate('Dashboard', {
          subPage: match[1],
        });
      }
    });
  }

  popout() {
    this.userService.popoutRecentEvents();
  }

  get previewWidth() {
    return this.customizationService.state.previewWidth;
  }

  set previewWidth(previewWidth: number) {
    this.customizationService.setSettings({ previewWidth });
  }

  get previewEnabled() {
    return (
      this.customizationService.state.livePreviewEnabled &&
      !this.performanceModeEnabled &&
      this.customizationService.state.previewEnabled
    );
  }

  get performanceModeEnabled() {
    return this.customizationService.state.performanceMode;
  }

  set previewEnabled(value: boolean) {
    this.customizationService.setLivePreviewEnabled(value);
  }

  get recenteventsUrl() {
    return this.userService.recentEventsUrl();
  }

  get height() {
    return this.customizationService.state.bottomdockSize;
  }

  set height(value) {
    this.customizationService.setSettings({ bottomdockSize: value });
  }

  get maxHeight() {
    return this.$root.$el.getBoundingClientRect().height;
  }

  get minHeight() {
    return 50;
  }

  onResizeStartHandler() {
    this.customizationService.setSettings({ previewEnabled: false });
  }

  @Debounce(500) // the preview window is flickering to much without debouncing
  onResizeStopHandler() {
    this.customizationService.setSettings({ previewEnabled: true });
  }
}
