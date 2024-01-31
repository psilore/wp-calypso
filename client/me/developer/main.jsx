import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ToggleControl } from '@wordpress/components';
import classnames from 'classnames';
import cookie from 'cookie';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import withFormBase from 'calypso/me/form-base/with-form-base';
import ReauthRequired from 'calypso/me/reauth-required';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice, removeNotice } from 'calypso/state/notices/actions';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import { DeveloperFeatures } from './features/index';
import { getIAmDeveloperCopy } from './get-i-am-a-developer-copy';

import './style.scss';

class Developer extends Component {
	developerSurveyNoticeId = 'developer-survey';

	getSurveyHref = () => {
		return 'https://wordpressdotcom.survey.fm/developer-survey';
	};

	setDeveloperSurveyCookie = ( value, maxAge ) => {
		document.cookie = cookie.serialize( 'developer_survey', value, {
			path: '/',
			maxAge,
		} );
	};

	shouldShowDevSurveyNotice = ( isDevAccount ) => {
		const cookies = cookie.parse( document.cookie );

		const isDevAccountEnabled = isDevAccount ?? this.props.getSetting( 'is_dev_account' );
		const isEN = this.props.currentUser.localeSlug === 'en';

		return (
			isEN &&
			isDevAccountEnabled &&
			! [ 'completed', 'dismissed' ].includes( cookies.developer_survey )
		);
	};

	showDevSurveyNotice = () => {
		const noticeMessage = this.props.translate(
			"Hey developer! How do {{i}}you{{/i}} use WordPress.com? Spare a moment? We'd love to hear what you think in a {{surveyLink}}quick survey{{/surveyLink}}.",
			{
				components: {
					i: <i />,
					surveyLink: (
						<a
							href={ this.getSurveyHref() }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => {
								recordTracksEvent( 'calypso_me_developer_survey_clicked' );

								this.props.removeNotice( this.developerSurveyNoticeId );
							} }
						/>
					),
				},
			}
		);

		const noticeProps = {
			id: this.developerSurveyNoticeId,
			isPersistent: true,
			onDismissClick: () => {
				recordTracksEvent( 'calypso_me_developer_survey_dismissed' );

				this.setDeveloperSurveyCookie( 'dismissed', 24 * 60 * 60 ); // 1 day

				this.props.removeNotice( this.developerSurveyNoticeId );
			},
		};

		this.props.successNotice( noticeMessage, noticeProps );
		recordTracksEvent( 'calypso_me_developer_survey_impression' );
	};

	handleToggleIsDevAccount = ( isDevAccount ) => {
		this.props.setUserSetting( 'is_dev_account', isDevAccount );

		recordTracksEvent( 'calypso_me_is_dev_account_toggled', {
			enabled: isDevAccount ? 1 : 0,
		} );

		if ( this.shouldShowDevSurveyNotice( isDevAccount ) ) {
			this.showDevSurveyNotice();
		} else {
			this.props.removeNotice( this.developerSurveyNoticeId );
		}

		setTimeout( () => this.props.removeNotice( 'save-user-settings' ), 3000 );
	};

	componentDidMount() {
		const urlParams = new URLSearchParams( window.location.search );

		if ( urlParams.get( 'survey' ) === 'completed' ) {
			this.setDeveloperSurveyCookie( 'completed', 365 * 24 * 60 * 60 ); // 1 years

			this.props.successNotice( this.props.translate( 'Thank you for your feedback!' ), {
				duration: 3000,
			} );
		}
	}

	componentDidUpdate( prevProps ) {
		const isJustLoadedUserSettings =
			prevProps.isFetchingUserSettings && ! this.props.isFetchingUserSettings;

		if ( isJustLoadedUserSettings && this.shouldShowDevSurveyNotice() ) {
			this.showDevSurveyNotice();
		}
	}

	render() {
		return (
			<Main className="developer" wideLayout>
				<PageViewTracker path="/me/developer" title="Me > Developer" />
				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />
				<NavigationHeader
					navigationItems={ [] }
					title={ this.props.translate( 'Developer Features' ) }
					subtitle={ this.props.translate(
						'Take WordPress.com further with early access to new developer features.'
					) }
					className="developer__header"
				/>

				<form onChange={ this.props.submitForm }>
					<FormFieldset
						className={ classnames( 'developer__is_dev_account-fieldset', {
							'is-loading': this.props.isFetchingUserSettings,
						} ) }
					>
						<ToggleControl
							disabled={ this.props.isFetchingUserSettings || this.props.isUpdatingUserSettings }
							checked={ this.props.getSetting( 'is_dev_account' ) }
							onChange={ this.handleToggleIsDevAccount }
							label={ getIAmDeveloperCopy( this.props.translate ) }
						/>
					</FormFieldset>
				</form>

				<DeveloperFeatures />
			</Main>
		);
	}
}

export default compose(
	connect(
		( state ) => ( {
			isFetchingUserSettings: isFetchingUserSettings( state ),
			currentUser: getCurrentUser( state ),
		} ),
		{
			successNotice,
			removeNotice,
		}
	),
	localize,
	withFormBase
)( Developer );