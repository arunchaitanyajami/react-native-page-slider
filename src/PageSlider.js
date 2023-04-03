import React, { Component } from 'react';
import { Dimensions, Platform, ScrollView, View, } from 'react-native';
class PageSlider extends Component {
    constructor(props) {
        super(props);
        this.offsetX = 0;
        this.hasDoneInitialScroll = false;
        this.scrollView = null;
        this.onContentSizeChange = (width, height) => {
            if (Platform.OS === 'android' &&
                width &&
                height &&
                this.initialSelectedPage &&
                !this.hasDoneInitialScroll) {
                this.scrollToPage(this.initialSelectedPage, false);
                this.hasDoneInitialScroll = true;
            }
        };
        this.onScroll = (e) => {
            this.offsetX = e.nativeEvent.contentOffset.x;
            const currentPage = this.getCurrentPage();
            this.props.onCurrentPageChange(currentPage);
        };
        this.onMomentumScrollEnd = () => {
            const currentPage = this.getCurrentPage();
            if (this.props.selectedPage !== currentPage) {
                this.props.onSelectedPageChange(currentPage);
            }
        };
        // Calculates page's width according to selected mode
        this.getPageWidth = () => {
            const { width } = Dimensions.get('screen');
            if (this.props.mode === 'page') {
                return this.props.width ? this.props.width : width;
            }
            const { peek, pageMargin } = this.props;
            return this.props.width ? this.props.width : width - 2 * peek + 2 * pageMargin;
        };
        // Get currently visible page
        this.getCurrentPage = () => {
            const pageWidth = this.getPageWidth();
            return Math.floor(this.offsetX / pageWidth - 0.5) + 1;
        };
        // Scroll to page by index
        this.scrollToPage = (index, animated = true) => {
            var _a;
            const pageWidth = this.getPageWidth();
            (_a = this.scrollView) === null || _a === void 0 ? void 0 : _a.scrollTo({ y: 0, x: index * pageWidth, animated });
        };
        // Android scrollView.scrollTo on component mount workaround
        this.initialSelectedPage = this.props.selectedPage;
    }
    componentDidMount() {
        if (Platform.OS === 'ios' && this.props.selectedPage) {
            // Doesn't work in Android
            this.scrollToPage(this.props.selectedPage, false);
        }
    }
    componentDidUpdate(prevProps) {
        const currentPage = this.getCurrentPage();
        if (prevProps.selectedPage !== this.props.selectedPage &&
            this.props.selectedPage !== currentPage &&
            this.props.selectedPage !== undefined) {
            this.scrollToPage(this.props.selectedPage);
        }
    }
    render() {
        const { children, mode, style } = this.props;
        const { width } = Dimensions.get('screen');
        const pageStyle = {
            height: this.props.height ? this.props.height : '100%',
        };
        let scrollViewProps = {};
        // Setup pages and ScrollView according to selected mode
        if (mode === 'page') {
            Object.assign(pageStyle, {
                width: this.props.width ? this.props.width : width,
            });
        }
        else if (mode === 'card') {
            const { contentPaddingVertical, peek, pageMargin } = this.props;
            scrollViewProps = {
                contentContainerStyle: {
                    paddingHorizontal: peek - pageMargin,
                    paddingVertical: contentPaddingVertical,
                },
                decelerationRate: 'fast',
                snapToAlignment: 'start',
                snapToInterval: this.getPageWidth(),
            };
            if (Platform.OS === 'ios') {
                /**
                 * pagingEnabled must be enabled on Android but cause warning on iOS
                 * when snapToInterval is set
                 */
                scrollViewProps.pagingEnabled = false;
            }
            Object.assign(pageStyle, {
                marginHorizontal: pageMargin,
                width: this.props.width ? this.props.width : width - 2 * peek,
            });
        }
        // Wrap children
        const pages = React.Children.map(children, (page) => {
            // Skip no valid react elements (null, boolean, undefined and etc.)
            if (!React.isValidElement(page)) {
                return null;
            }
            return (<View key={page.key} style={pageStyle}>
          {page}
        </View>);
        });
        return (<ScrollView style={style} ref={(scrollView) => {
                this.scrollView = scrollView;
            }} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onContentSizeChange={this.onContentSizeChange} onScroll={this.onScroll} onMomentumScrollEnd={this.onMomentumScrollEnd} scrollEventThrottle={8} {...scrollViewProps}>
        {pages}
      </ScrollView>);
    }
}
PageSlider.defaultProps = {
    mode: 'page',
    pageMargin: 8,
    peek: 24,
};
export { PageSlider };
