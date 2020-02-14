import React, { FunctionComponent, useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import debounce from 'lodash.debounce';
import { AutoComplete, Icon, Input, Tag, Button, Tooltip } from 'antd';
import BusesService from '../../../services/buses';
import { BusLine, BusDirection } from '../../../types';
import MainCtx from '../../../contexts/mainCtx';
import "./styles.scss";

const { Option, OptGroup } = AutoComplete;

interface BusDirectionToggleProps {
  currentLine: BusLine,
  currentDirection: BusDirection,
  onChange: (direction: BusDirection) => void
};

const BusDirectionToggle: FunctionComponent<BusDirectionToggleProps> = ({ currentLine, currentDirection, onChange }) => {
  return (
    <div className="bus-direction-toggle" style={{ display: 'flex' }}>
      <div className="bus-direction-toggle-limits">
        {
          currentDirection === 1 && (
            <>
              <span className="bus-limit">{currentLine.terminal1}</span>
              &nbsp;<Icon type="arrow-right" />&nbsp;
            </>
          )
        }
        <span className="bus-limit">{currentLine.terminal2}</span>
        {
          currentDirection === 2 && (
            <>
              &nbsp;<Icon type="arrow-right" />&nbsp;
              <span className="bus-limit">{currentLine.terminal1}</span>
            </>
          )
        }
      </div>
      <div>
        <Tooltip autoAdjustOverflow={true} placement='right' title='Inverter rota'>
          <Button type='primary' onClick={() => onChange(currentDirection === 1 ? 2 : 1)} icon="swap" />
        </Tooltip>
      </div>
    </div>
  );
};

interface BusLineSelectorProps {
  value?: string
};

function getDestinationOrder(busLine: BusLine) {
  if (busLine.direction === 1) {
    return `${busLine.destinationLabel1} - ${busLine.destinationLabel2}`;
  } else if (busLine.direction === 2) {
    return `${busLine.destinationLabel2} - ${busLine.destinationLabel1}`;
  }
}

const BusLineSelector: FunctionComponent<BusLineSelectorProps> = ({ value }) => {
  const {
    currentLine,
    currentDirection, setCurrentDirection
  } = useContext(MainCtx);

  const [searchQuery, setSearchQuery] = useState<string>();
  const [searchResults, setSearchResults] = useState<{ [key: string]: BusLine[] }>({});
  const history = useHistory();

  useEffect(() => {
    const fetchSearchResults = debounce((query: string) => {
        BusesService.searchLines(query)
        .then(({ data }) => {
          setSearchResults(data);
        });
    }, 500);

    if (searchQuery) {
      fetchSearchResults(searchQuery);
    }
  }, [searchQuery]);


  const handleBusLineSelection = (busLine: string) => {
    history.push(`/line/${busLine}/${currentDirection}`);
  };

  const handleLineDirectionSelection = (direction: BusDirection) => {
    if (currentLine) {
      setCurrentDirection(direction);
      history.push(`/line/${currentLine.lineName}/${direction}`);
    }
  };

  return (
    <>
      <AutoComplete
        className="certain-category-search"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 300 }}
        onSearch={setSearchQuery}
        backfill={true}
        defaultOpen={true}
        size="large"
        style={{ width: '100%' }}
        placeholder="Busque por nome ou número da linha"
        optionLabelProp="value"
        dataSource={Object.keys(searchResults).map((lineName) => (
          <OptGroup
            key={lineName}
            label={<Tag>{lineName}</Tag>}
          >
            {searchResults[lineName].slice(0, 1).map(busLine => (
              <Option key={busLine.lineCode} value={`${busLine.signText}-${busLine.operationMode}`}>
                {getDestinationOrder(busLine)}
              </Option>
            ))}
          </OptGroup>
        ))}
        onSelect={value => {
          if (searchResults) {
            handleBusLineSelection(value as string)
          }
        }}
      >
        <Input
          value={currentLine && currentLine.lineName}
          suffix={<Icon type="search" className="certain-category-icon" />}
        />
      </AutoComplete>
      {
        currentLine && currentDirection && <BusDirectionToggle
          currentLine={currentLine}
          currentDirection={currentDirection}
          onChange={(direction: number) => {
            if (direction === 1 || direction === 2) {
              handleLineDirectionSelection(direction);
            }
          }}
        />
      }
    </>
  );
};

export default BusLineSelector;