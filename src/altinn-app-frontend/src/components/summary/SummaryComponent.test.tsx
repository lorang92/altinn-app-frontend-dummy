import * as React from 'react';
import { renderWithProviders } from '../../../testUtils';
import { screen, fireEvent } from '@testing-library/react';

import { ISummaryComponent, SummaryComponent } from './SummaryComponent';
import { IValidations } from 'src/types';
import {
  FormLayoutActions,
  ILayoutState,
} from 'src/features/form/layout/formLayoutSlice';
import { ILayoutComponent } from 'src/features/form/layout';
import { getFormLayoutStateMock } from '../../../__mocks__/mocks';

describe('SummaryComponent', () => {
  const defaultId = 'default';
  const pageId = 'FormLayout';
  const layoutMock = (): ILayoutState =>
    getFormLayoutStateMock({
      layouts: {
        [pageId]: [
          ...[
            defaultId,
            'group',
            'Group',
            'FileUpload',
            'FileUploadWithTag',
            'Checkboxes',
          ].map(
            (t) =>
              ({
                id: t,
                type: t,
                dataModelBindings: {},
                textResourceBindings: {},
                children: [],
                maxCount: 0,
              } as ILayoutComponent),
          ),
        ],
      },
    });
  test('should render group', () => {
    renderHelper({ componentRef: 'group' });
    expect(screen.getByTestId('summary-group-component')).toBeInTheDocument();
  });
  test('should render Group (spelled differently)', () => {
    renderHelper({ componentRef: 'Group' });
    expect(screen.getByTestId('summary-group-component')).toBeInTheDocument();
  });
  test('should render file upload', () => {
    renderHelper({ componentRef: 'FileUpload' });
    expect(
      screen.getByTestId('attachment-summary-component'),
    ).toBeInTheDocument();
  });
  test('should render file upload with tag', () => {
    renderHelper({ componentRef: 'FileUploadWithTag' });
    expect(
      screen.getByTestId('attachment-with-tag-summary'),
    ).toBeInTheDocument();
  });
  test('should render checkboxes', () => {
    renderHelper({ componentRef: 'Checkboxes' });
    expect(screen.getByTestId('multiple-choice-summary')).toBeInTheDocument();
  });
  test('should render default', () => {
    renderHelper({ componentRef: defaultId });
    expect(screen.getByTestId('single-input-summary')).toBeInTheDocument();
  });
  test('should render with validation message', () => {
    renderHelper(
      { componentRef: defaultId },
      {
        [pageId]: {
          [defaultId]: {
            simpleBinding: {
              errors: ['Error message'],
              warnings: [],
            },
          },
        },
      },
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });
  test('should not render if hidden', () => {
    const otherLayout = {
      ...layoutMock(),
    };
    otherLayout.uiConfig.hiddenFields = [defaultId];
    const { container } = renderHelper(
      { componentRef: defaultId },
      {},
      otherLayout,
    );
    expect(container.firstChild).toBeNull();
    expect(container.childElementCount).toBe(0);
  });

  test('should get title text from resource or default', () => {
    const otherLayout = {
      ...layoutMock(),
    };
    otherLayout.layouts[pageId][0].textResourceBindings = {
      title: 'default title',
    };
    renderHelper({ componentRef: defaultId }, {}, otherLayout);
    expect(screen.getByText('default title')).toBeInTheDocument();
  });

  test('should respond to on change click', () => {
    const spy = jest.spyOn(FormLayoutActions, 'updateCurrentView');
    const otherLayout = {
      ...layoutMock(),
    };
    otherLayout.uiConfig.currentView = 'otherPage';
    const theRender = renderHelper(
      { componentRef: defaultId },
      {},
      otherLayout,
    );
    const button =
      theRender.container.querySelector<HTMLButtonElement>('button');
    fireEvent.click(button);
    expect(spy).toHaveBeenCalledWith({
      newView: pageId,
      runValidations: null,
      returnToView: 'otherPage',
    });
  });

  const renderHelper = (
    extendProps: Partial<ISummaryComponent>,
    validations: IValidations = {},
    mockLayout = layoutMock(),
  ) => {
    return renderWithProviders(
      <SummaryComponent id={defaultId} pageRef={pageId} {...extendProps} />,
      {
        preloadedState: {
          formLayout: mockLayout,
          formValidations: {
            validations,
            error: null,
            invalidDataTypes: [],
            currentSingleFieldValidation: {},
          },
        },
      },
    );
  };
});
