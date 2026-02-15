# Template Redux Component

```
import { useEffect } from 'react';
import { dashboardMaintenanceSelectors } from 'src/redux/sections/dashboard/maintenances';
import { connect, ConnectedProps, RootState } from 'src/redux/store';

const $NameComponent = ({ dueDate }: PropsFromRedux) => {
  useEffect(() => {}, []);

  return <></>;
};

interface OwnProps {}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { selectDueDay } = dashboardMaintenanceSelectors;
  return {
    ...ownProps,
    dueDate: selectDueDay(state),
  };
};

const connector = connect(mapStateToProps, {});

type PropsFromRedux = ConnectedProps<typeof connector>;
const NameComponent = connector($NameComponent);

export default NameComponent;
```