import { CloseOutlined } from '@ant-design/icons';
import { useContext, utils } from '@alipay/graphinsight';
import GremlinEditor from 'ace-gremlin-editor';
import Graphin from '@antv/graphin';
import iconLoader from '@antv/graphin-icons';
import { Button, Col, Divider, Row } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import './index.less';

const icons = Graphin.registerFontFamily(iconLoader);
const defSpringLen = (_edge, source, target) => {
  // NOTE: 固定200还是效果好
  // return 200;
  /** 默认返回的是 200 的弹簧长度 */
  /** 如果你要想要产生聚类的效果，可以考虑 根据边两边节点的度数来动态设置边的初始化长度：度数越小，则边越短 */
  const defaultSpring = 100;
  const Sdegree = source.data.layout.degree;
  const Tdegree = target.data.layout.degree;
  const MinDegree = Math.min(Sdegree, Tdegree);

  let SpringLength = defaultSpring;
  if (MinDegree < 5) {
    SpringLength = defaultSpring * MinDegree;
  } else {
    SpringLength = 500;
  }
  // console.log(Sdegree, Tdegree, MinDegree, MaxDegree, "SpringLength", SpringLength);

  return SpringLength;
};

export interface IGremlinQueryProps {
  onClose: () => void;
  initValue?: string;
  theme?: 'dark' | 'light';
  height?: number;
  showGutter?: boolean;
  serviceId: string;
  style?: React.CSSProperties | undefined;
}

const GremlinQueryPanel: React.FC<IGremlinQueryProps> = ({
  onClose,
  initValue = '',
  theme = 'dark',
  height = 220,
  showGutter = false,
  serviceId,
  style,
}) => {
  console.log('style', style);

  const { data, updateContext, transform, services } = useContext();

  const service = utils.getService(services, serviceId);

  const [editorValue, setEditorValue] = useState(initValue || '');

  const handleChangeEditorValue = (value: string) => {
    setEditorValue(value);
  };

  const [btnLoading, setBtnLoading] = useState(false);

  const handleClickQuery = async () => {
    setBtnLoading(true);
    if (!service) {
      return;
    }

    const result = await service({
      value: editorValue,
    }).then(response => response.json());

    setBtnLoading(false);
    console.log('Gremlin 查询结果', result);
    if (!result || !result.success) {
      return;
    }

    const newData = utils.handleExpand(data, result.data);

    updateContext(draft => {
      const res = transform(newData);
      console.log('转换后的数据', res);
      res.nodes.forEach(node => {
        if (!node.style.badges) {
          node.style.badges = [];
        }
        // 保留其他位置的 badges，例如锁定和标签
        node.style.badges = node.style.badges.filter(({ position }) => position !== 'LB') || [];

        const expandIds = result.data.nodes.map(n => n.id);
        if (expandIds.indexOf(node.id) !== -1) {
          node.style.badges.push({
            position: 'LB',
            type: 'font',
            fontFamily: 'graphin',
            value: icons['plus-circle'],
            size: [12, 12],
            color: '#fff',
            fill: '#4DB6AC',
            stroke: '#4DB6AC',
          });
        }
      });

      draft.data = res;
      draft.source = res;
      draft.isLoading = false;
      draft.layout = {
        type: 'graphin-force',
        animation: false,
        preset: {
          type: 'concentric',
        },
        defSpringLen,
      };
    });
  };

  return (
    <div
      className={'gremlineQueryPanel'}
      style={
        {
          height: 'fit-content',
          position: 'absolute',
          ...style,
        } as any
      }
    >
      <Row className={classNames('header', 'handle')}>
        <Col span={22} className={'title'}>
          Gremlin 查询
        </Col>
        <Col span={2}>
          <span className={'collapseIcon'} onClick={onClose}>
            <CloseOutlined />
          </span>
        </Col>
      </Row>
      <div
        className={'contentContainer'}
        style={{
          display: 'block',
        }}
      >
        <div className={'blockContainer'}>
          <div style={{ marginBottom: 8 }}>请输入 Gremlin 语句：</div>
          <div style={{ border: '1px solid var(--main-editor-border-color)', borderRadius: '2px' }}>
            <GremlinEditor
              theme={theme}
              initValue={editorValue}
              gremlinId="query-analysis"
              height={height}
              showGutter={showGutter}
              onValueChange={value => handleChangeEditorValue(value)}
            />
          </div>
        </div>
      </div>
      <div className={'buttonContainer'}>
        <Divider className={'divider'} />
        <Button className={'queryButton'} loading={btnLoading} type="primary" onClick={handleClickQuery}>
          查询
        </Button>
      </div>
    </div>
  );
};

export default GremlinQueryPanel;
