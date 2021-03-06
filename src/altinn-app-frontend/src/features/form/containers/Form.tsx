/* eslint-disable no-undef */
import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { SummaryComponent } from 'src/components/summary/SummaryComponent';
import { ILayout, ILayoutComponent, ILayoutGroup } from '../layout';
import { GroupContainer } from './GroupContainer';
import { renderGenericComponent } from 'src/utils/layout';
import { DisplayGroupContainer } from './DisplayGroupContainer';
import { useAppSelector } from 'src/common/hooks';
import MessageBanner from 'src/features/form/components/MessageBanner';
import { hasRequiredFields } from 'src/utils/formLayout';
import { missingFieldsInLayoutValidations } from 'src/utils/validation';

export function renderLayoutComponent(layoutComponent: ILayoutComponent | ILayoutGroup, layout: ILayout) {
  switch (layoutComponent.type) {
    case 'group':
    case 'Group': {
      return RenderLayoutGroup(layoutComponent as ILayoutGroup, layout);
    }
    case 'Summary': {
      return (
        <SummaryComponent key={layoutComponent.id} {...(layoutComponent as ILayoutComponent)} />
      );
    }
    default: {
      return (
        <RenderGenericComponent key={layoutComponent.id} {...(layoutComponent as ILayoutComponent)} />
      );
    }
  }
}

function RenderGenericComponent(component: ILayoutComponent, layout: ILayout) {
  return renderGenericComponent(component, layout);
}

function RenderLayoutGroup(layoutGroup: ILayoutGroup, layout: ILayout): JSX.Element {
  const groupComponents = layoutGroup.children.map((child) => {
    let childId = child;
    if (layoutGroup.edit?.multiPage) {
      childId = child.split(':')[1] || child;
    }
    return layout.find((c) => c.id === childId) as ILayoutComponent;
  });
  const repeating = layoutGroup.maxCount > 1;
  if (!repeating) {
    // If not repeating, treat as regular components
    return (
      <DisplayGroupContainer
        key={layoutGroup.id}
        container={layoutGroup}
        components={groupComponents}
        renderLayoutComponent={renderLayoutComponent}
      />
    );
  }

  return (
    <GroupContainer
      container={layoutGroup}
      id={layoutGroup.id}
      key={layoutGroup.id}
      components={groupComponents}
    />
  );
}

export function Form() {
  const [filteredLayout, setFilteredLayout] = React.useState<any[]>([]);
  const [currentLayout, setCurrentLayout] = React.useState<string>();
  const [requiredFieldsMissing, setRequiredFieldsMissing] = React.useState(false);

  const currentView = useAppSelector(state => state.formLayout.uiConfig.currentView);
  const layout = useAppSelector(state => state.formLayout.layouts[state.formLayout.uiConfig.currentView]);
  const language = useAppSelector(state => state.language.language);
  const validations = useAppSelector(state => state.formValidations.validations);

  React.useEffect(() => {
    setCurrentLayout(currentView);
  }, [currentView]);

  React.useEffect(() => {
    if (validations && validations[currentView]) {
      const areRequiredFieldsMissing = missingFieldsInLayoutValidations(validations[currentView], language)
      setRequiredFieldsMissing(areRequiredFieldsMissing);
    }
  }, [currentView, language, validations]);

  React.useEffect(() => {
    let renderedInGroup: string[] = [];
    if (layout) {
      const groupComponents = layout.filter((component) => component.type.toLowerCase() === 'group');
      groupComponents.forEach((component: ILayoutGroup) => {
        let childList = component.children;
        if (component.edit?.multiPage) {
          childList = component.children.map((childId) => childId.split(':')[1] || childId);
        }
        renderedInGroup = renderedInGroup.concat(childList);
      });
      const componentsToRender = layout.filter((component) => !renderedInGroup.includes(component.id));
      setFilteredLayout(componentsToRender);
    }
  }, [layout]);

  return (
    <div>
      {hasRequiredFields(layout) &&
        <MessageBanner
          language={language}
          error={requiredFieldsMissing}
          messageKey={'form_filler.required_description'}
        />
      }
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        {currentView === currentLayout && filteredLayout && filteredLayout.map((component) => {
          return renderLayoutComponent(component, layout);
        })}
      </Grid>
    </div>
  );
}

export default Form;
