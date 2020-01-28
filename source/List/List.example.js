import clsx from 'clsx';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import * as React from 'react';
import * as _ from 'lodash';
import styles from './List.example.css';
import AutoSizer from '../AutoSizer';
import List from './List';
import {
  ContentBox,
  ContentBoxHeader,
  ContentBoxParagraph,
} from '../demo/ContentBox';
import {LabeledInput, InputRow} from '../demo/LabeledInput';
import CellMeasurer, {CellMeasurerCache} from '../CellMeasurer';

export default class ListExample extends React.PureComponent {
  static contextTypes = {
    list: PropTypes.instanceOf(Immutable.List).isRequired,
  };

  cache = new CellMeasurerCache();

  constructor(props, context) {
    super(props, context);

    this.listRef = React.createRef();

    this.state = {
      listHeight: 300,
      listRowHeight: 50,
      overscanRowCount: 10,
      rowCount: 30000,
      scrollToIndex: undefined,
      showScrollingPlaceholder: false,
      useDynamicRowHeight: true,
    };

    this._getRowHeight = this._getRowHeight.bind(this);
    this._noRowsRenderer = this._noRowsRenderer.bind(this);
    this._onRowCountChange = this._onRowCountChange.bind(this);
    this._onScrollToRowChange = this._onScrollToRowChange.bind(this);
    this._rowRenderer = this._rowRenderer.bind(this);
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    if (this.listRef && this.listRef.current && this.state.scrollToIndex) {
      // this.listRef.current.scrollToRow(this.state.scrollToIndex);
    }
  }
  // 14000
  // 20000

  render() {
    const {
      listHeight,
      listRowHeight,
      overscanRowCount,
      rowCount,
      scrollToIndex,
      showScrollingPlaceholder,
      useDynamicRowHeight,
    } = this.state;

    return (
      <ContentBox>
        <ContentBoxHeader
          text="List"
          sourceLink="https://github.com/bvaughn/react-virtualized/blob/master/source/List/List.example.js"
          docsLink="https://github.com/bvaughn/react-virtualized/blob/master/docs/List.md"
        />

        <ContentBoxParagraph>
          The list below is windowed (or "virtualized") meaning that only the
          visible rows are rendered. Adjust its configurable properties below to
          see how it reacts.
        </ContentBoxParagraph>

        <ContentBoxParagraph>
          <label className={styles.checkboxLabel}>
            <input
              aria-label="Use dynamic row heights?"
              checked={useDynamicRowHeight}
              className={styles.checkbox}
              type="checkbox"
              onChange={event =>
                this.setState({useDynamicRowHeight: event.target.checked})
              }
            />
            Use dynamic row heights?
          </label>

          <label className={styles.checkboxLabel}>
            <input
              aria-label="Show scrolling placeholder?"
              checked={showScrollingPlaceholder}
              className={styles.checkbox}
              type="checkbox"
              onChange={event => {
                this.setState({
                  showScrollingPlaceholder: event.target.checked,
                });
              }}
            />
            Show scrolling placeholder?
          </label>
        </ContentBoxParagraph>

        <InputRow>
          <LabeledInput
            label="Num rows"
            name="rowCount"
            onChange={this._onRowCountChange}
            value={rowCount}
          />
          <LabeledInput
            label="Scroll to"
            name="onScrollToRow"
            placeholder="Index..."
            onChange={this._onScrollToRowChange}
            value={scrollToIndex || ''}
          />
          <LabeledInput
            label="List height"
            name="listHeight"
            onChange={event =>
              this.setState({
                listHeight: parseInt(event.target.value, 10) || 1,
              })
            }
            value={listHeight}
          />
          <LabeledInput
            disabled={useDynamicRowHeight}
            label="Row height"
            name="listRowHeight"
            onChange={event =>
              this.setState({
                listRowHeight: parseInt(event.target.value, 10) || 1,
              })
            }
            value={listRowHeight}
          />
          <LabeledInput
            label="Overscan"
            name="overscanRowCount"
            onChange={event =>
              this.setState({
                overscanRowCount: parseInt(event.target.value, 10) || 0,
              })
            }
            value={overscanRowCount}
          />
        </InputRow>

        <div>
          <AutoSizer disableHeight>
            {({width}) => (
              <List
                ref={this.listRef}
                className={styles.List}
                height={listHeight}
                overscanRowCount={overscanRowCount}
                noRowsRenderer={this._noRowsRenderer}
                rowCount={rowCount}
                rowRenderer={this._rowRenderer}
                rowHeight={this.cache.rowHeight}
                scrollToIndex={scrollToIndex}
                width={width}
              />
            )}
          </AutoSizer>
        </div>
      </ContentBox>
    );
  }

  // 14000
  _getDatum(index) {
    const {list} = this.context;

    return list.get(index % list.size);
  }

  _getRowHeight({index}) {
    return this._getDatum(index).size;
  }

  _noRowsRenderer() {
    return <div className={styles.noRows}>No rows</div>;
  }

  _onRowCountChange(event) {
    const rowCount = parseInt(event.target.value, 10) || 0;

    this.setState({rowCount});
  }

  _onScrollToRowChange(event) {
    const {rowCount} = this.state;
    let scrollToIndex = Math.min(
      rowCount - 1,
      parseInt(event.target.value, 10),
    );

    if (isNaN(scrollToIndex)) {
      scrollToIndex = undefined;
    }

    this.setState({scrollToIndex});
  }

  _rowRenderer({index, isScrolling, key, style, parent}) {
    const {showScrollingPlaceholder, useDynamicRowHeight} = this.state;

    if (showScrollingPlaceholder && isScrolling) {
      return (
        <CellMeasurer
          cache={this.cache}
          key={key}
          parent={parent}
          columnIndex={0}
          rowIndex={index}>
          <div
            className={clsx(styles.row, styles.isScrollingPlaceholder)}
            key={key}
            style={style}>
            Scrolling...
          </div>
        </CellMeasurer>
      );
    }

    const datum = this._getDatum(index);

    let additionalContent;

    if (useDynamicRowHeight) {
      switch (datum.size) {
        case 75:
          additionalContent = <div>It is medium-sized.</div>;
          break;
        case 10000:
          additionalContent = (
            <div>
              It is large-sized.
              <br />
              It has a 3rd row.
              <br />
              And a fourth row
            </div>
          );
          break;
      }
    }

    console.log('rendering a row');
    return (
      <CellMeasurer
        cache={this.cache}
        key={key}
        parent={parent}
        columnIndex={0}
        rowIndex={index}>
        <div className={styles.row} key={key} style={style}>
          Ryan
          <div
            className={styles.letter}
            style={{
              backgroundColor: datum.color,
            }}>
            {datum.name.charAt(0)}
          </div>
          <div>
            <div className={styles.name}>{datum.name}</div>
            <div className={styles.index}>This is row {index}</div>
            {additionalContent}
          </div>
          {useDynamicRowHeight && (
            <span className={styles.height}>{datum.size}px</span>
          )}
        </div>
      </CellMeasurer>
    );
  }
}
